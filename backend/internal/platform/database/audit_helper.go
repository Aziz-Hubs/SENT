package database

import (
	"context"
	"encoding/json"
	"time"

	platformdb "sent/internal/db/platform/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// LogAuditRecord creates an entry in the immutable AuditLog hypertable.
func LogAuditRecord(ctx context.Context, pool *pgxpool.Pool, tenantID int, appName string, action string, actorID string, payload map[string]interface{}) error {
	queries := platformdb.New(pool)
	payloadJSON, _ := json.Marshal(payload)

	return queries.CreateAuditLog(ctx, platformdb.CreateAuditLogParams{
		TenantID:  pgtype.Int4{Int32: int32(tenantID), Valid: true},
		AppName:   pgtype.Text{String: appName, Valid: true},
		Action:    action,
		ActorID:   pgtype.Text{String: actorID, Valid: true},
		Payload:   payloadJSON,
		Timestamp: pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
}
