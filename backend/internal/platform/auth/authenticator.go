package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zalando/go-keyring"
	"github.com/zitadel/oidc/v3/pkg/client/rp"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

// AuthBridge handles authentication flow, session management, and user synchronization.
type AuthBridge struct {
	ctx          context.Context
	db           *pgxpool.Pool
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

// NewAuthBridge initializes a new AuthBridge instance.
//
// @param db - The database client for user synchronization.
// @returns A pointer to the initialized AuthBridge.
func NewAuthBridge(db *pgxpool.Pool) *AuthBridge {
	return &AuthBridge{
		db:      db,
		rpReady: make(chan struct{}),
		states:  make(map[string]time.Time),
	}
}

// Startup initializes the authentication bridge and attempts silent refresh.
//
// @param ctx - The application context.
func (a *AuthBridge) Startup(ctx context.Context) {
	fmt.Println("[AUTH] Starting AuthBridge...")
	a.ctx = ctx

	// Initialize OIDC RP in a separate goroutine to avoid GTK/WebKit signal conflicts
	go func() {
		a.initRP()
		// Only try auto-login after RP is ready, as we might need it for refresh
		if err := a.ensureRP(); err == nil {
			a.performSilentRefresh()
		}
	}()
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

		// Request offline_access to get refresh token
		scopes := []string{oidc.ScopeOpenID, oidc.ScopeProfile, oidc.ScopeEmail, oidc.ScopeOfflineAccess}

		fmt.Printf("[AUTH] Initializing OIDC RP with issuer: %s, client: %s\n", issuer, clientID)

		client := &http.Client{
			Timeout: discoveryTimeout,
		}

		// IMPORTANT: Enable PKCE with rp.WithPKCE(nil) which uses S256 by default
		provider, err := rp.NewRelyingPartyOIDC(a.ctx, issuer, clientID, "", callbackURL, scopes,
			rp.WithHTTPClient(client),
			rp.WithPKCE(nil),
		)
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
	// If already ready, return immediately
	select {
	case <-a.rpReady:
		return a.rpErr
	default:
	}

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

	// Manual PKCE implementation to bypass v3 helper resolution issues
	verifierBytes := make([]byte, 32)
	if _, err := rand.Read(verifierBytes); err != nil {
		return "", fmt.Errorf("failed to generate verifier: %w", err)
	}
	pkceVerifier := base64.RawURLEncoding.EncodeToString(verifierBytes)

	sha := sha256.New()
	sha.Write([]byte(pkceVerifier))
	pkceChallenge := base64.RawURLEncoding.EncodeToString(sha.Sum(nil))

	authURL := rp.AuthURL(state, a.relyingParty, rp.WithCodeChallenge(pkceChallenge))

	if err := openBrowser(authURL); err != nil {
		return "", fmt.Errorf("failed to open browser: %w", err)
	}

	// Wait for code or timeout
	select {
	case code := <-codeChan:
		return a.exchangeCode(code, pkceVerifier)
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
