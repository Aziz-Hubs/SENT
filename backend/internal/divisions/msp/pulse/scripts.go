package pulse

import (
	"context"
	"fmt"

	pulsedb "sent/internal/db/msp/pulse/sqlc"
	platformdb "sent/internal/db/platform/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ScriptManager handles script CRUD
type ScriptManager struct {
	pool            *pgxpool.Pool
	queries         *pulsedb.Queries
	platformQueries *platformdb.Queries
}

func NewScriptManager(pool *pgxpool.Pool) *ScriptManager {
	return &ScriptManager{
		pool:            pool,
		queries:         pulsedb.New(pool),
		platformQueries: platformdb.New(pool),
	}
}

// Script represents an executable payload.
type Script struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Content     string `json:"content"`
	Type        string `json:"type"`
}

// CreateScript creates a new script
func (m *ScriptManager) CreateScript(ctx context.Context, tenantName string, name, description, content, scriptType string) (*Script, error) {
	// Basic validation
	if name == "" {
		return nil, fmt.Errorf("script name is required")
	}

	tenantID, err := m.platformQueries.GetTenantByName(ctx, tenantName)
	if err != nil {
		// Fallback to first tenant for MVP if name not found
		err = m.pool.QueryRow(ctx, "SELECT id FROM tenants LIMIT 1").Scan(&tenantID)
		if err != nil {
			return nil, fmt.Errorf("tenant failed: %w", err)
		}
	}

	id, err := m.queries.CreateScript(ctx, pulsedb.CreateScriptParams{
		TenantID:    tenantID,
		Name:        name,
		Description: pgtype.Text{String: description, Valid: true},
		Content:     content,
		Type:        pgtype.Text{String: scriptType, Valid: true},
	})

	if err != nil {
		return nil, err
	}

	return &Script{
		ID:          int(id.ID),
		Name:        name,
		Description: description,
		Content:     content,
		Type:        scriptType,
	}, nil
}

// ListScripts returns all scripts for a tenant
func (m *ScriptManager) ListScripts(ctx context.Context, tenantName string) ([]Script, error) {
	tenantID, err := m.platformQueries.GetTenantByName(ctx, tenantName)
	if err != nil {
		return nil, err
	}

	rows, err := m.queries.ListScripts(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var scripts []Script
	for _, r := range rows {
		scripts = append(scripts, Script{
			ID:          int(r.ID),
			Name:        r.Name,
			Description: r.Description.String,
			Content:     r.Content,
			Type:        r.Type.String,
		})
	}
	return scripts, nil
}

// UpdateScript updates a script
func (m *ScriptManager) UpdateScript(ctx context.Context, id int, content string) (*Script, error) {
	// Note: Generic update simplified here
	res, err := m.queries.UpdateScript(ctx, pulsedb.UpdateScriptParams{
		ID:      int32(id),
		Content: content,
	})
	if err != nil {
		return nil, err
	}

	return &Script{
		ID:          int(res.ID),
		Name:        res.Name,
		Description: res.Description.String,
		Content:     res.Content,
		Type:        res.Type.String,
	}, nil
}

// DeleteScript deletes a script
func (m *ScriptManager) DeleteScript(ctx context.Context, id int) error {
	return m.queries.DeleteScript(ctx, int32(id))
}
