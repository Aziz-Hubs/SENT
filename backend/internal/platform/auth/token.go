package auth

import (
	"encoding/json"
	"fmt"

	"github.com/zalando/go-keyring"
	"github.com/zitadel/oidc/v3/pkg/client/rp"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

// performSilentRefresh attempts to retrieve a stored token set and refresh it if needed.
func (a *AuthBridge) performSilentRefresh() {
	tokenStr, err := keyring.Get(serviceName, tokenKey)
	if err != nil {
		fmt.Printf("[AUTH] No stored token found: %v\n", err)
		return
	}

	var storedTokens TokenSet
	if err := json.Unmarshal([]byte(tokenStr), &storedTokens); err != nil {
		fmt.Printf("[AUTH] Failed to unmarshal stored tokens: %v\n", err)
		return
	}

	// Check if we need to refresh (e.g., if expired or close to expiry)
	// For simplicity, we'll just always try to refresh if we have a refresh token
	// to ensure the session is still valid on the server side.
	if storedTokens.RefreshToken != "" {
		fmt.Println("[AUTH] Attempting silent refresh...")
		newTokens, err := rp.RefreshTokens[*oidc.IDTokenClaims](a.ctx, a.relyingParty, storedTokens.RefreshToken, "", "")
		if err != nil {
			fmt.Printf("[AUTH] Silent refresh failed: %v. Requiring new login.\n", err)
			// Clear invalid tokens
			keyring.Delete(serviceName, tokenKey)
			return
		}

		// Update stored tokens
		updatedTokenSet := TokenSet{
			AccessToken:  newTokens.AccessToken,
			RefreshToken: newTokens.RefreshToken,
			IDToken:      newTokens.IDToken,
			Expiry:       newTokens.Expiry,
		}

		// If new refresh token is empty, keep the old one (some providers don't rotate it every time)
		if updatedTokenSet.RefreshToken == "" {
			updatedTokenSet.RefreshToken = storedTokens.RefreshToken
		}

		if err := a.saveTokens(updatedTokenSet); err != nil {
			fmt.Printf("[AUTH] Failed to save refreshed tokens: %v\n", err)
		}

		// Use the ID Token to get user info.
		// Note: RefreshAccessToken returns Tokens[*oidc.IDTokenClaims], so IDTokenClaims is populated
		claims := newTokens.IDTokenClaims

		a.updateSession(claims)
		fmt.Println("[AUTH] Silent refresh successful.")

	} else {
		// Fallback for legacy tokens that might just be ID Token Claims?
		// For now, if no refresh token, we just fail silent auth and require login.
		fmt.Println("[AUTH] No refresh token available, requiring login.")
	}
}

// exchangeCode exchanges the authorization code for tokens and updates the session.
func (a *AuthBridge) exchangeCode(code string, pkceVerifier string) (string, error) {
	// Pass the PKCE verifier
	tokens, err := rp.CodeExchange[*oidc.IDTokenClaims](a.ctx, code, a.relyingParty, rp.WithCodeVerifier(pkceVerifier))
	if err != nil {
		return "", fmt.Errorf("code exchange failed: %w", err)
	}

	// Persist token set
	tokenSet := TokenSet{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken, // Should be present now with offline_access
		IDToken:      tokens.IDToken,
		Expiry:       tokens.Expiry,
	}

	if err := a.saveTokens(tokenSet); err != nil {
		fmt.Printf("[AUTH] Warning: Failed to save tokens to keyring: %v\n", err)
	}

	a.updateSession(tokens.IDTokenClaims)

	if err := a.syncUserToDB(); err != nil {
		return "Authenticated, but user sync failed", err
	}

	return "Authenticated", nil
}

func (a *AuthBridge) saveTokens(tokens TokenSet) error {
	tokenBytes, err := json.Marshal(tokens)
	if err != nil {
		return err
	}
	return keyring.Set(serviceName, tokenKey, string(tokenBytes))
}

func (a *AuthBridge) updateSession(claims *oidc.IDTokenClaims) {
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
}
