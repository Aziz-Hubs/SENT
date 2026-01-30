package auth

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/user"
)

const (
	RoleAdmin = "admin"
)

// Guard enforces role-based and permission-based access control.
// It verifies if the user (identified by ZitadelID) exists and holds the required permission.
//
// @param ctx - The context.
// @param db - The database client.
// @param zitadelID - The unique subject ID from the OIDC provider.
// @param permissionCode - The required permission string (e.g., "account:read").
// @returns nil if authorized, or an error if forbidden/not found.
func Guard(ctx context.Context, db *ent.Client, zitadelID string, permissionCode string) error {
	if zitadelID == "" {
		return fmt.Errorf("unauthorized: missing identity")
	}

	// 1. Fetch user and their permissions
	u, err := db.User.Query().
		Where(user.ZitadelID(zitadelID)).
		WithPermissions().
		Only(ctx)
	
	if err != nil {
		if ent.IsNotFound(err) {
			return fmt.Errorf("unauthorized: user profile not found for ID %s", zitadelID)
		}
		return fmt.Errorf("internal auth error: %w", err)
	}

	// 2. Admin Superuser Bypass
	// We check for the specific RoleAdmin constant.
	if u.Role == RoleAdmin {
		return nil
	}

	// 3. Check for specific permission
	// Note: u.Edges.Permissions is guaranteed to be non-nil by WithPermissions() 
	// even if the user has no permissions (it will be an empty slice).
	for _, p := range u.Edges.Permissions {
		if p.Code == permissionCode {
			return nil
		}
	}

	return fmt.Errorf("forbidden: user %s lacks permission '%s'", u.Email, permissionCode)
}
