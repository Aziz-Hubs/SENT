package admin

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/tenant"
	"sent/pkg/auth"
)

// AdminBridge handles administrative operations such as user and organization management.
type AdminBridge struct {
	ctx  context.Context
	db   *ent.Client
	auth *auth.AuthBridge
}

// OrgDTO represents a data transfer object for an Organization (Tenant).
type OrgDTO struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Domain string `json:"domain"`
	Active bool   `json:"active"`
}

// UserDTO represents a data transfer object for a User, including their organization.
type UserDTO struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
	OrgName   string `json:"orgName"`
}

// NewAdminBridge initializes a new AdminBridge.
func NewAdminBridge(db *ent.Client, auth *auth.AuthBridge) *AdminBridge {
	return &AdminBridge{db: db, auth: auth}
}

// Startup initializes the bridge with the Wails context.
func (a *AdminBridge) Startup(ctx context.Context) {
	a.ctx = ctx
}

// GetOrgs retrieves all organizations (tenants).
//
// @returns A list of organization DTOs or an error.
func (a *AdminBridge) GetOrgs() ([]OrgDTO, error) {
	if !a.auth.HasRole("super_admin") {
		return nil, fmt.Errorf("permission denied: super_admin role required")
	}

	orgs, err := a.db.Tenant.Query().Order(ent.Asc(tenant.FieldName)).All(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch organizations: %w", err)
	}

	dtos := make([]OrgDTO, len(orgs))
	for i, o := range orgs {
		dtos[i] = OrgDTO{
			ID:     o.ID,
			Name:   o.Name,
			Domain: o.Domain,
			Active: o.Active,
		}
	}
	return dtos, nil
}

// GetUsers retrieves all users and their associated organization names.
//
// @returns A list of user DTOs or an error.
func (a *AdminBridge) GetUsers() ([]UserDTO, error) {
	if !a.auth.HasRole("super_admin") {
		return nil, fmt.Errorf("permission denied: super_admin role required")
	}

	users, err := a.db.User.Query().WithTenant().All(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}

	dtos := make([]UserDTO, len(users))
	for i, u := range users {
		orgName := "None"
		if u.Edges.Tenant != nil {
			orgName = u.Edges.Tenant.Name
		}
		
		dtos[i] = UserDTO{
			ID:        u.ID,
			Email:     u.Email,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Role:      u.Role,
			OrgName:   orgName,
		}
	}
	return dtos, nil
}

// DeleteOrg deletes an organization by its ID.
//
// @param id - The organization ID.
// @returns An error if the operation fails.
func (a *AdminBridge) DeleteOrg(id int) error {
	if !a.auth.HasRole("super_admin") {
		return fmt.Errorf("permission denied: super_admin role required")
	}

	if err := a.db.Tenant.DeleteOneID(id).Exec(a.ctx); err != nil {
		return fmt.Errorf("failed to delete organization %d: %w", id, err)
	}
	return nil
}

// DeleteUser deletes a user by their ID.
//
// @param id - The user ID.
// @returns An error if the operation fails.
func (a *AdminBridge) DeleteUser(id int) error {
	if !a.auth.HasRole("super_admin") {
		return fmt.Errorf("permission denied: super_admin role required")
	}

	if err := a.db.User.DeleteOneID(id).Exec(a.ctx); err != nil {
		return fmt.Errorf("failed to delete user %d: %w", id, err)
	}
	return nil
}

// CreateOrg creates a new organization (tenant).
func (a *AdminBridge) CreateOrg(name string, domain string) (*OrgDTO, error) {
	if !a.auth.HasRole("super_admin") {
		return nil, fmt.Errorf("permission denied: super_admin role required")
	}

	o, err := a.db.Tenant.Create().
		SetName(name).
		SetDomain(domain).
		SetActive(true).
		Save(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create organization: %w", err)
	}
	return &OrgDTO{
		ID:     o.ID,
		Name:   o.Name,
		Domain: o.Domain,
		Active: o.Active,
	}, nil
}

// CreateUser creates a new user within an organization.
func (a *AdminBridge) CreateUser(email string, firstName string, lastName string, role string, orgID int) (*UserDTO, error) {
	if !a.auth.HasRole("super_admin") {
		return nil, fmt.Errorf("permission denied: super_admin role required")
	}

	u, err := a.db.User.Create().
		SetEmail(email).
		SetFirstName(firstName).
		SetLastName(lastName).
		SetRole(role).
		SetTenantID(orgID).
		Save(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	org, _ := a.db.Tenant.Get(a.ctx, orgID)
	orgName := "None"
	if org != nil {
		orgName = org.Name
	}

	return &UserDTO{
		ID:        u.ID,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Role:      u.Role,
		OrgName:   orgName,
	}, nil
}

// GetStats returns usage statistics for the system.
func (a *AdminBridge) GetStats() (map[string]int, error) {
	uCount, err := a.db.User.Query().Count(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	oCount, err := a.db.Tenant.Query().Count(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to count organizations: %w", err)
	}

	return map[string]int{
		"users": uCount,
		"orgs":  oCount,
	}, nil
}
