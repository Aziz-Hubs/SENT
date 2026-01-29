package control

import (
	"context"
	"sent/ent"
	"sent/ent/saasfilter"
	"sent/ent/tenant"
	"strings"
)

type ControlEngine struct {
	db *ent.Client
}

func NewControlEngine(db *ent.Client) *ControlEngine {
	return &ControlEngine{db: db}
}

// GetSNIRules returns a map of domain patterns to actions for SENTgrid consumption.
func (e *ControlEngine) GetSNIRules(ctx context.Context, tenantID int) (map[string]string, error) {
	filters, err := e.db.SaaSFilter.Query().
		Where(saasfilter.HasTenantWith(tenant.ID(tenantID))).
		All(ctx)
	if err != nil {
		return nil, err
	}

	rules := make(map[string]string)
	for _, f := range filters {
		rules[f.DomainPattern] = string(f.Action)
	}
	return rules, nil
}

// DecideBlock determines if a given SNI should be blocked based on tenant policies.
func (e *ControlEngine) DecideBlock(ctx context.Context, tenantID int, sni string) (bool, string) {
	rules, err := e.GetSNIRules(ctx, tenantID)
	if err != nil {
		return false, "ALLOW"
	}

	// Simple pattern matching for MVP
	for pattern, action := range rules {
		if e.matchPattern(sni, pattern) {
			return action == "BLOCK", action
		}
	}

	return false, "ALLOW" // Default allow
}

func (e *ControlEngine) matchPattern(sni, pattern string) bool {
	if pattern == "*" {
		return true
	}
	if strings.HasPrefix(pattern, "*.") {
		suffix := pattern[1:]
		return strings.HasSuffix(sni, suffix)
	}
	return sni == pattern
}
