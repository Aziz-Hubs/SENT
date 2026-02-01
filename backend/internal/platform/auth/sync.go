package auth

import (
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

// syncUserToDB synchronizes the authenticated user profile with the local database.
// It creates a new user and/or tenant if they do not exist.
func (a *AuthBridge) syncUserToDB() error {
	var userID int
	var role string
	var seniority string
	var tenantID int

	// Attempt to find user by Zitadel ID
	err := a.db.QueryRow(a.ctx, "SELECT id, role, seniority, tenant_id FROM users WHERE zitadel_id = $1", a.userProfile.Subject).
		Scan(&userID, &role, &seniority, &tenantID)

	if err == pgx.ErrNoRows {
		// Secure Provisioning:
		// 1. Determine Tenant by email domain
		domain := ""
		if parts := strings.Split(a.userProfile.Email, "@"); len(parts) == 2 {
			domain = parts[1]
		}

		err = a.db.QueryRow(a.ctx, "SELECT id FROM tenants WHERE domain = $1", domain).Scan(&tenantID)
		if err == pgx.ErrNoRows {
			// If no domain match, check if any tenant exists.
			var count int
			_ = a.db.QueryRow(a.ctx, "SELECT COUNT(*) FROM tenants").Scan(&count)
			if count == 0 {
				err = a.db.QueryRow(a.ctx, "INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING id", "Root Org", domain).Scan(&tenantID)
				if err != nil {
					return fmt.Errorf("failed to anchor root tenant: %w", err)
				}
			} else {
				return fmt.Errorf("no tenant found matching domain %s; access denied", domain)
			}
		} else if err != nil {
			return fmt.Errorf("tenant lookup failed: %w", err)
		}

		// 2. Atomic Create
		err = a.db.QueryRow(a.ctx, `
			INSERT INTO users (zitadel_id, email, first_name, last_name, tenant_id, role) 
			VALUES ($1, $2, $3, $4, $5, $6) 
			ON CONFLICT (zitadel_id) DO UPDATE SET 
				email = EXCLUDED.email, 
				first_name = EXCLUDED.first_name, 
				last_name = EXCLUDED.last_name
			RETURNING id, role, seniority, tenant_id`,
			a.userProfile.Subject, a.userProfile.Email, a.userProfile.FirstName, a.userProfile.LastName, tenantID, "user").
			Scan(&userID, &role, &seniority, &tenantID)

		if err != nil {
			return fmt.Errorf("failed to sync user: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("database identity query failed: %w", err)
	}

	a.mu.Lock()
	a.userProfile.TenantID = tenantID
	a.userProfile.Role = role
	a.userProfile.Seniority = seniority
	a.mu.Unlock()

	return nil
}
