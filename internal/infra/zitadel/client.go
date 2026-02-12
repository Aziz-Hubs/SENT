package zitadel

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client wraps the Zitadel Management API
type Client struct {
	BaseURL    string
	Token      string
	HTTPClient *http.Client
	Disabled   bool // When true, return empty data gracefully
}

// NewClient creates a new Zitadel client
func NewClient(baseURL, token string) *Client {
	return &Client{
		BaseURL:  baseURL,
		Token:    token,
		Disabled: token == "",
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// CreateOrganization creates a new organization in ZITADEL using the v2 API.
// Returns the Organization ID.
func (c *Client) CreateOrganization(name string) (string, error) {
	// Zitadel v2 API endpoint for creating organizations
	url := fmt.Sprintf("%s/v2/organizations", c.BaseURL)

	body := map[string]interface{}{
		"name": name,
	}
	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("failed to create org: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	// Parse response to extract organization ID
	var result struct {
		OrganizationId string `json:"organizationId"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w, body: %s", err, string(respBody))
	}

	if result.OrganizationId == "" {
		return "", fmt.Errorf("no organization ID in response: %s", string(respBody))
	}

	return result.OrganizationId, nil
}

// AddOIDCProvider adds a Generic OIDC Provider to the specified Organization.
// This allows the organization to use an external IdP (Azure AD, Google, etc.).
func (c *Client) AddOIDCProvider(orgId, name, clientId, clientSecret, issuer string) error {
	// Zitadel v2 API endpoint for adding an OIDC IDP
	url := fmt.Sprintf("%s/v2/idps/generic_oidc", c.BaseURL)

	body := map[string]interface{}{
		"name":           name,
		"clientId":       clientId,
		"clientSecret":   clientSecret,
		"issuer":         issuer,
		"scopes":         []string{"openid", "profile", "email"},
		"isAutoCreation": true,
		"isAutoUpdate":   true,
	}
	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgId) // Target the specific organization

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to add IdP: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// Organization represents a Zitadel organization
type Organization struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	State         string `json:"state"`
	PrimaryDomain string `json:"primaryDomain"`
}

// ListOrganizations fetches all organizations from Zitadel
func (c *Client) ListOrganizations() ([]Organization, error) {
	if c.Disabled {
		return []Organization{}, nil // Graceful fallback
	}

	url := fmt.Sprintf("%s/v2/organizations", c.BaseURL)

	// POST request with empty query (returns all)
	body := map[string]interface{}{
		"query": map[string]interface{}{
			"limit": 100,
		},
	}
	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", url+"/_search", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("failed to list orgs: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	// Zitadel v2 API returns result array with org fields directly (not nested under 'organization')
	var result struct {
		Result []struct {
			ID            string `json:"id"`
			Name          string `json:"name"`
			State         string `json:"state"`
			PrimaryDomain string `json:"primaryDomain"`
		} `json:"result"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	orgs := make([]Organization, len(result.Result))
	for i, r := range result.Result {
		orgs[i] = Organization{
			ID:            r.ID,
			Name:          r.Name,
			State:         r.State,
			PrimaryDomain: r.PrimaryDomain,
		}
	}

	return orgs, nil
}

// GetOrganization fetches a single organization by ID
func (c *Client) GetOrganization(orgID string) (*Organization, error) {
	url := fmt.Sprintf("%s/v2/organizations/%s", c.BaseURL, orgID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("failed to get org: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Organization Organization `json:"organization"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result.Organization, nil
}

// DeleteOrganization removes an organization from Zitadel
func (c *Client) DeleteOrganization(orgID string) error {
	url := fmt.Sprintf("%s/v2/organizations/%s", c.BaseURL, orgID)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete org: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// DeactivateOrganization suspends an organization (disables auth)
func (c *Client) DeactivateOrganization(orgID string) error {
	url := fmt.Sprintf("%s/management/v1/orgs/me/_deactivate", c.BaseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgID)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to deactivate org: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// ReactivateOrganization re-enables an organization
func (c *Client) ReactivateOrganization(orgID string) error {
	url := fmt.Sprintf("%s/management/v1/orgs/me/_reactivate", c.BaseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgID)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to reactivate org: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// User represents a Zitadel user
type User struct {
	ID        string `json:"userId"`
	Username  string `json:"username"`
	State     string `json:"state"`
	CreatedAt string `json:"createdAt"`
	Human     struct {
		Profile struct {
			GivenName  string `json:"givenName"`
			FamilyName string `json:"familyName"`
		} `json:"profile"`
		Email struct {
			Email           string `json:"email"`
			IsEmailVerified bool   `json:"isEmailVerified"`
		} `json:"email"`
	} `json:"human"`
}

// ListUsers fetches users from Zitadel, scoped to an organization
func (c *Client) ListUsers(orgID string) ([]User, error) {
	if c.Disabled {
		return []User{}, nil // Graceful fallback
	}

	// Zitadel v2 API: POST /v2/users for listing users
	url := fmt.Sprintf("%s/v2/users", c.BaseURL)

	// Add organizationIdQuery to filter users by organization
	body := map[string]interface{}{
		"queries": []map[string]interface{}{
			{
				"organizationIdQuery": map[string]interface{}{
					"organizationId": orgID,
				},
			},
		},
	}
	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgID)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("failed to list users: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Result []User `json:"result"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return result.Result, nil
}

// AddHumanUser creates a new human user in Zitadel
func (c *Client) AddHumanUser(orgID, username, email, firstName, lastName, password string) (string, error) {
	if c.Disabled {
		return "", fmt.Errorf("Zitadel integration disabled: ZITADEL_PAT not configured. Please set the ZITADEL_PAT environment variable")
	}

	url := fmt.Sprintf("%s/v2/users/human", c.BaseURL)

	body := map[string]interface{}{
		"username": username,
		"profile": map[string]string{
			"givenName":  firstName,
			"familyName": lastName,
		},
		"email": map[string]interface{}{
			"email":           email,
			"isEmailVerified": true,
		},
	}

	if password != "" {
		body["password"] = map[string]interface{}{
			"password":       password,
			"changeRequired": false,
		}
	}

	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgID)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("failed to create user: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		UserID string `json:"userId"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	return result.UserID, nil
}

// DeleteUser removes a user from Zitadel
func (c *Client) DeleteUser(orgID, userID string) error {
	url := fmt.Sprintf("%s/v2/users/%s", c.BaseURL, userID)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("x-zitadel-orgid", orgID)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete user: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}
