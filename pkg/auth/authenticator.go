package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"sync"
	"time"

	"sent/ent"
	"sent/ent/tenant"
	"sent/ent/user"

	"github.com/zalando/go-keyring"
	"github.com/zitadel/oidc/v3/pkg/client/rp"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

const (
	serviceName      = "sent-core-app"
	tokenKey         = "auth-token"
	defaultIssuer    = "http://localhost:8080"
	defaultClientID  = "357700606812553219"
	callbackPath     = "/auth/callback"
	callbackPort     = "4242"
	callbackURL      = "http://localhost:" + callbackPort + callbackPath
	loginTimeout     = 5 * time.Minute
	discoveryTimeout = 5 * time.Second
)

// AuthBridge handles authentication flow, session management, and user synchronization.
type AuthBridge struct {
	ctx          context.Context
	db           *ent.Client
	mu           sync.RWMutex // Protects isLoggedIn and userProfile
	isLoggedIn   bool
	userProfile  *UserProfile
	relyingParty rp.RelyingParty
	rpOnce       sync.Once
	rpErr        error
	rpReady      chan struct{}
	
	statesMu sync.Mutex
	states   map[string]time.Time // Pending states with expiry
}

// UserProfile represents the authenticated user's details.
type UserProfile struct {
	Subject   string `json:"sub"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Picture   string `json:"picture"`
	FirstName string `json:"given_name"`
	LastName  string `json:"family_name"`
	TenantID  int    `json:"tenantId"`
	Role      string `json:"role"`
	Seniority string `json:"seniority"`
}

// NewAuthBridge initializes a new AuthBridge instance.
//
// @param db - The database client for user synchronization.
// @returns A pointer to the initialized AuthBridge.
func NewAuthBridge(db *ent.Client) *AuthBridge {
	return &AuthBridge{
		db:      db,
		rpReady: make(chan struct{}),
		states:  make(map[string]time.Time),
	}
}

// Startup initializes the authentication bridge and attempts auto-login.
//
// @param ctx - The application context.
func (a *AuthBridge) Startup(ctx context.Context) {
	fmt.Println("[AUTH] Starting AuthBridge...")
	a.ctx = ctx
	
	// Initialize OIDC RP in a separate goroutine to avoid GTK/WebKit signal conflicts
	go func() {
		a.initRP()
	}()
	
	a.tryAutoLogin()
}

// initRP initializes the OIDC Relying Party exactly once.
// This is called from a goroutine to avoid signal handler conflicts with WebKit.
func (a *AuthBridge) initRP() {
	a.rpOnce.Do(func() {
		issuer := os.Getenv("ZITADEL_ISSUER")
		if issuer == "" {
			issuer = defaultIssuer
		}

		clientID := os.Getenv("ZITADEL_CLIENT_ID")
		if clientID == "" {
			clientID = defaultClientID
		}

		scopes := []string{oidc.ScopeOpenID, oidc.ScopeProfile, oidc.ScopeEmail}

		fmt.Printf("[AUTH] Initializing OIDC RP with issuer: %s, client: %s\n", issuer, clientID)

		client := &http.Client{
			Timeout: discoveryTimeout,
		}

		provider, err := rp.NewRelyingPartyOIDC(a.ctx, issuer, clientID, "", callbackURL, scopes, rp.WithHTTPClient(client))
		if err != nil {
			a.rpErr = fmt.Errorf("zitadel discovery failed: %w", err)
			fmt.Printf("[AUTH] Failed to initialize OIDC RP: %v\n", a.rpErr)
		} else {
			a.relyingParty = provider
			fmt.Println("[AUTH] OIDC RP initialized successfully")
		}
		// Signal that initialization is complete (success or failure)
		close(a.rpReady)
	})
}

// ensureRP waits for the Relying Party to be initialized and returns any error.
//
// @returns An error if initialization failed.
func (a *AuthBridge) ensureRP() error {
	fmt.Println("[AUTH] Waiting for OIDC RP initialization...")
	// Wait for initialization to complete with timeout
	select {
	case <-a.rpReady:
		if a.rpErr != nil {
			fmt.Printf("[AUTH] OIDC RP initialization failed: %v\n", a.rpErr)
		} else {
			fmt.Println("[AUTH] OIDC RP is ready")
		}
		return a.rpErr
	case <-time.After(30 * time.Second):
		return fmt.Errorf("timeout waiting for OIDC initialization")
	}
}

// tryAutoLogin attempts to retrieve a stored token and log the user in automatically.
func (a *AuthBridge) tryAutoLogin() {
	tokenStr, err := keyring.Get(serviceName, tokenKey)
	if err != nil {
		// No token found or keyring error, just return.
		return
	}

	var claims oidc.IDTokenClaims
	if err := json.Unmarshal([]byte(tokenStr), &claims); err != nil {
		fmt.Printf("[AUTH] Failed to unmarshal stored token: %v\n", err)
		return
	}

	a.mu.Lock()
	a.isLoggedIn = true
	a.userProfile = &UserProfile{
		Subject:   claims.Subject,
		Name:      claims.Name,
		Email:     claims.Email,
		FirstName: claims.GivenName,
		LastName:  claims.FamilyName,
	}
	a.mu.Unlock()

	if err := a.syncUserToDB(); err != nil {
		fmt.Printf("[AUTH] Auto-login sync failed: %v\n", err)
		// Optionally invalidate session here if sync is strictly required.
	}
}

// Login initiates the OIDC authentication flow.
//
// @returns The status message or an error.
func (a *AuthBridge) Login() (string, error) {
	if err := a.ensureRP(); err != nil {
		return "", err
	}

	// Generate high-entropy state
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate random state: %w", err)
	}
	state := base64.RawURLEncoding.EncodeToString(b)
	
	// Track state for validation
	a.statesMu.Lock()
	a.states[state] = time.Now().Add(loginTimeout)
	a.statesMu.Unlock()
	
	// Start local server to receive callback
	l, err := net.Listen("tcp", "localhost:"+callbackPort)
	if err != nil {
		return "", fmt.Errorf("failed to start local callback listener: %w", err)
	}
	defer l.Close()

	// Prepare callback handler
	codeChan := make(chan string)
	server := a.startCallbackServer(l, codeChan, state)
	defer server.Close()

	// Open browser for authentication
	authURL := rp.AuthURL(state, a.relyingParty)
	if err := openBrowser(authURL); err != nil {
		return "", fmt.Errorf("failed to open browser: %w", err)
	}

	// Wait for code or timeout
	select {
	case code := <-codeChan:
		return a.exchangeCode(code)
	case <-time.After(loginTimeout):
		return "", fmt.Errorf("login timed out after %v", loginTimeout)
	}
}

// startCallbackServer starts the HTTP server to handle the OIDC callback.
func (a *AuthBridge) startCallbackServer(l net.Listener, codeChan chan<- string, expectedState string) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc(callbackPath, func(w http.ResponseWriter, r *http.Request) {
		// 1. Validate State
		returnedState := r.URL.Query().Get("state")
		a.statesMu.Lock()
		expiry, exists := a.states[returnedState]
		if exists {
			delete(a.states, returnedState) // One-time use
		}
		a.statesMu.Unlock()

		if !exists || time.Now().After(expiry) || returnedState != expectedState {
			w.WriteHeader(http.StatusForbidden)
			fmt.Fprintf(w, "Invalid or expired state")
			return
		}

		code := r.URL.Query().Get("code")
		// Provide a nice response to the user
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, `
			<html>
				<body style='font-family:sans-serif; text-align:center; padding-top:50px; background:#0f172a; color:white;'>
					<h1>SENT Authenticated</h1>
					<p>You can close this window now and return to the application.</p>
				</body>
			</html>
		`)
		if code != "" {
			codeChan <- code
		}
	})

	srv := &http.Server{Handler: mux}
	go func() {
		if err := srv.Serve(l); err != nil && err != http.ErrServerClosed {
			fmt.Printf("[AUTH] Callback server error: %v\n", err)
		}
	}()
	return srv
}

// exchangeCode exchanges the authorization code for tokens and updates the session.
func (a *AuthBridge) exchangeCode(code string) (string, error) {
	tokens, err := rp.CodeExchange[*oidc.IDTokenClaims](a.ctx, code, a.relyingParty)
	if err != nil {
		return "", fmt.Errorf("code exchange failed: %w", err)
	}

	// Persist token securely
	tokenBytes, err := json.Marshal(tokens.IDTokenClaims)
	if err == nil {
		if err := keyring.Set(serviceName, tokenKey, string(tokenBytes)); err != nil {
			fmt.Printf("[AUTH] Warning: Failed to save token to keyring: %v\n", err)
		}
	}

	a.mu.Lock()
	a.isLoggedIn = true
	a.userProfile = &UserProfile{
		Subject:   tokens.IDTokenClaims.Subject,
		Name:      tokens.IDTokenClaims.Name,
		Email:     tokens.IDTokenClaims.Email,
		FirstName: tokens.IDTokenClaims.GivenName,
		LastName:  tokens.IDTokenClaims.FamilyName,
	}
	a.mu.Unlock()

	if err := a.syncUserToDB(); err != nil {
		return "Authenticated, but user sync failed", err
	}

	return "Authenticated", nil
}

// syncUserToDB synchronizes the authenticated user profile with the local database.
// It creates a new user and/or tenant if they do not exist.
func (a *AuthBridge) syncUserToDB() error {
	// Attempt to find user by Zitadel ID
	u, err := a.db.User.Query().Where(user.ZitadelID(a.userProfile.Subject)).Only(a.ctx)
	
	if ent.IsNotFound(err) {
		// Secure Provisioning: 
		// 1. Determine Tenant by email domain
		domain := ""
		if parts := strings.Split(a.userProfile.Email, "@"); len(parts) == 2 {
			domain = parts[1]
		}

		t, err := a.db.Tenant.Query().Where(tenant.Domain(domain)).Only(a.ctx)
		if ent.IsNotFound(err) {
			// If no domain match, check if any tenant exists. If not, this is the very first system setup.
			count, _ := a.db.Tenant.Query().Count(a.ctx)
			if count == 0 {
				t, err = a.db.Tenant.Create().
					SetName("Root Org").
					SetDomain(domain).
					Save(a.ctx)
				if err != nil {
					return fmt.Errorf("failed to anchor root tenant: %w", err)
				}
			} else {
				// Prevent orphaned users - map to a "Pending" or default tenant if logic allows,
				// but for high-security, we'll fail if domain doesn't match and it's not the first setup.
				return fmt.Errorf("no tenant found matching domain %s; access denied", domain)
			}
		} else if err != nil {
			return fmt.Errorf("tenant lookup failed: %w", err)
		}

		// 2. Atomic Create (using DB uniqueness to handle races)
		newU, err := a.db.User.Create().
			SetZitadelID(a.userProfile.Subject).
			SetEmail(a.userProfile.Email).
			SetFirstName(a.userProfile.FirstName).
			SetLastName(a.userProfile.LastName).
			SetTenant(t).
			SetRole("user"). // Default to user, admin must be promoted by system:admin
			Save(a.ctx)
			
		if err != nil {
			// Check if we lost a race
			u, err = a.db.User.Query().Where(user.ZitadelID(a.userProfile.Subject)).Only(a.ctx)
			if err != nil {
				return fmt.Errorf("failed to resolve user after conflict: %w", err)
			}
		} else {
			u = newU
		}
	} else if err != nil {
		return fmt.Errorf("database identity query failed: %w", err)
	}

	// Update profile with synced data
	tID, err := u.QueryTenant().OnlyID(a.ctx)
	if err != nil {
		return fmt.Errorf("identity partition error: %w", err)
	}
	
	a.mu.Lock()
	a.userProfile.TenantID = tID
	a.userProfile.Role = u.Role
	a.userProfile.Seniority = string(u.Seniority)
	a.mu.Unlock()

	return nil
}

// HasRole checks if the currently logged-in user has the required role.
func (a *AuthBridge) HasRole(role string) bool {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if !a.isLoggedIn || a.userProfile == nil {
		return false
	}
	// Admin bypass: Admins have access to everything
	if a.userProfile.Role == "admin" {
		return true
	}
	return a.userProfile.Role == role
}

// Logout clears the session and removes the stored token.
func (a *AuthBridge) Logout() {
	if err := keyring.Delete(serviceName, tokenKey); err != nil {
		fmt.Printf("[AUTH] Warning: Failed to delete token from keyring: %v\n", err)
	}
	a.mu.Lock()
	a.userProfile = nil
	a.isLoggedIn = false
	a.mu.Unlock()
}

// GetUserProfile returns the profile of the currently logged-in user.
//
// @returns The user profile or an error if not logged in.
func (a *AuthBridge) GetUserProfile() (*UserProfile, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()

	if !a.isLoggedIn {
		return nil, fmt.Errorf("not logged in")
	}
	return a.userProfile, nil
}

// IsAuthenticated checks if a user is currently logged in.
//
// @returns True if authenticated, false otherwise.
func (a *AuthBridge) IsAuthenticated() bool {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.isLoggedIn
}

// openBrowser opens the specified URL in the default browser.
func openBrowser(url string) error {
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default:
		cmd = "xdg-open"
		args = []string{url}
	}
	return exec.Command(cmd, args...).Start()
}
