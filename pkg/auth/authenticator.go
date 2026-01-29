package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"time"

	"sent/ent"
	"sent/ent/user"

	"github.com/zalando/go-keyring"
	"github.com/zitadel/oidc/v3/pkg/client/rp"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

const (
	serviceName      = "sent-core-app"
	tokenKey         = "auth-token"
	defaultIssuer    = "http://localhost:8080"
	defaultClientID  = "sent-core-app"
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
	isLoggedIn   bool
	userProfile  *UserProfile
	relyingParty rp.RelyingParty
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
}

// NewAuthBridge initializes a new AuthBridge instance.
//
// @param db - The database client for user synchronization.
// @returns A pointer to the initialized AuthBridge.
func NewAuthBridge(db *ent.Client) *AuthBridge {
	return &AuthBridge{db: db}
}

// Startup initializes the authentication bridge and attempts auto-login.
//
// @param ctx - The application context.
func (a *AuthBridge) Startup(ctx context.Context) {
	fmt.Println("[AUTH] Starting AuthBridge...")
	a.ctx = ctx
	a.tryAutoLogin()
}

// ensureRP ensures that the OpenID Connect Relying Party is initialized.
//
// @returns An error if initialization fails.
func (a *AuthBridge) ensureRP() error {
	if a.relyingParty != nil {
		return nil
	}

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
		return fmt.Errorf("zitadel discovery failed: %w", err)
	}
	a.relyingParty = provider
	return nil
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

	a.isLoggedIn = true
	a.userProfile = &UserProfile{
		Subject:   claims.Subject,
		Name:      claims.Name,
		Email:     claims.Email,
		FirstName: claims.GivenName,
		LastName:  claims.FamilyName,
	}

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

	state := fmt.Sprintf("state-%d", time.Now().Unix())
	
	// Start local server to receive callback
	l, err := net.Listen("tcp", "localhost:"+callbackPort)
	if err != nil {
		return "", fmt.Errorf("failed to start local callback listener: %w", err)
	}
	defer l.Close()

	// Prepare callback handler
	codeChan := make(chan string)
	server := a.startCallbackServer(l, codeChan)
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
func (a *AuthBridge) startCallbackServer(l net.Listener, codeChan chan<- string) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc(callbackPath, func(w http.ResponseWriter, r *http.Request) {
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

	a.isLoggedIn = true
	a.userProfile = &UserProfile{
		Subject:   tokens.IDTokenClaims.Subject,
		Name:      tokens.IDTokenClaims.Name,
		Email:     tokens.IDTokenClaims.Email,
		FirstName: tokens.IDTokenClaims.GivenName,
		LastName:  tokens.IDTokenClaims.FamilyName,
	}

	if err := a.syncUserToDB(); err != nil {
		return "Authenticated, but user sync failed", err
	}

	return "Authenticated", nil
}

// syncUserToDB synchronizes the authenticated user profile with the local database.
// It creates a new user and/or tenant if they do not exist.
func (a *AuthBridge) syncUserToDB() error {
	u, err := a.db.User.Query().Where(user.ZitadelID(a.userProfile.Subject)).Only(a.ctx)
	
	if ent.IsNotFound(err) {
		// User not found, create new user (and tenant if needed)
		tenant, err := a.db.Tenant.Query().First(a.ctx)
		if err != nil && !ent.IsNotFound(err) {
			return fmt.Errorf("failed to query tenants: %w", err)
		}

		if tenant == nil {
			// Create default tenant
			tenant, err = a.db.Tenant.Create().
				SetName("Default Org").
				SetDomain("sent.jo").
				Save(a.ctx)
			if err != nil {
				return fmt.Errorf("failed to create default tenant: %w", err)
			}
		}

		newU, err := a.db.User.Create().
			SetZitadelID(a.userProfile.Subject).
			SetEmail(a.userProfile.Email).
			SetFirstName(a.userProfile.FirstName).
			SetLastName(a.userProfile.LastName).
			SetTenant(tenant).
			Save(a.ctx)
		if err != nil {
			return fmt.Errorf("failed to create new user: %w", err)
		}
		a.userProfile.TenantID = newU.ID
	} else if err != nil {
		// Other database error
		return fmt.Errorf("database error checking user: %w", err)
	} else {
		// User exists
		a.userProfile.TenantID = u.ID
	}
	return nil
}

// Logout clears the session and removes the stored token.
func (a *AuthBridge) Logout() {
	if err := keyring.Delete(serviceName, tokenKey); err != nil {
		fmt.Printf("[AUTH] Warning: Failed to delete token from keyring: %v\n", err)
	}
	a.userProfile = nil
	a.isLoggedIn = false
}

// GetUserProfile returns the profile of the currently logged-in user.
//
// @returns The user profile or an error if not logged in.
func (a *AuthBridge) GetUserProfile() (*UserProfile, error) {
	if !a.isLoggedIn {
		return nil, fmt.Errorf("not logged in")
	}
	return a.userProfile, nil
}

// IsAuthenticated checks if a user is currently logged in.
//
// @returns True if authenticated, false otherwise.
func (a *AuthBridge) IsAuthenticated() bool {
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
