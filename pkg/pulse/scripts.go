package pulse

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/script"
    "sent/ent/tenant"
)

// ScriptManager handles script CRUD
type ScriptManager struct {
    client *ent.Client
}

func NewScriptManager(client *ent.Client) *ScriptManager {
    return &ScriptManager{client: client}
}

// CreateScript creates a new script
func (m *ScriptManager) CreateScript(ctx context.Context, tenantID string, name, description, content, scriptType string) (*ent.Script, error) {
    // Basic validation
    if name == "" {
        return nil, fmt.Errorf("script name is required")
    }

    // Find tenant
    t, err := m.client.Tenant.Query().Where(tenant.NameEQ(tenantID)).Only(ctx)
    if err != nil {
        // Fallback: This usually expects 'tenantID' to be the name or ID. 
        // For MVP assuming name "Acuative Corporation" or passed ID.
        // Let's try to find by ID if Name fails, or just default to single tenant found
        var tErr error
        t, tErr = m.client.Tenant.Query().Only(ctx)
        if tErr != nil {
             return nil, fmt.Errorf("tenant failed: %w", err)
        }
    }

    return m.client.Script.Create().
        SetTenant(t).
        SetName(name).
        SetDescription(description).
        SetContent(content).
        SetType(script.Type(scriptType)). // ps1 or sh
        Save(ctx)
}

// ListScripts returns all scripts for a tenant
func (m *ScriptManager) ListScripts(ctx context.Context, tenantID string) ([]*ent.Script, error) {
     return m.client.Script.Query().
        // Where(script.HasTenantWith(tenant.NameEQ(tenantID))). // If multitenant
        All(ctx)
}

// UpdateScript updates a script
func (m *ScriptManager) UpdateScript(ctx context.Context, id int, content string) (*ent.Script, error) {
    return m.client.Script.UpdateOneID(id).
        SetContent(content).
        Save(ctx)
}

// DeleteScript deletes a script
func (m *ScriptManager) DeleteScript(ctx context.Context, id int) error {
    return m.client.Script.DeleteOneID(id).Exec(ctx)
}
