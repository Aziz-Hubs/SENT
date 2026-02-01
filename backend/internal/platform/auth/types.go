package auth

import (
	"time"
)

const (
	serviceName      = "sent-core-app"
	tokenKey         = "auth-token-set"
	defaultIssuer    = "http://localhost:8080"
	defaultClientID  = "357700606812553219"
	callbackPath     = "/auth/callback"
	callbackPort     = "4242"
	callbackURL      = "http://localhost:" + callbackPort + callbackPath
	loginTimeout     = 5 * time.Minute
	discoveryTimeout = 5 * time.Second
)

// TokenSet represents the persisted authentication tokens.
type TokenSet struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	IDToken      string    `json:"id_token"`
	Expiry       time.Time `json:"expiry"`
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
