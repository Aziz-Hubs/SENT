package database

import (
	"context"
	"sent/ent"
	"time"
)

// LogAuditRecord creates an entry in the immutable AuditLog hypertable.
func LogAuditRecord(ctx context.Context, client *ent.Client, tenantID int, appName string, action string, actorID string, payload map[string]interface{}) error {
	return client.AuditLog.Create().
		SetTenantID(tenantID).
		SetAppName(appName).
		SetAction(action).
		SetActorID(actorID).
		SetPayload(payload).
		SetTimestamp(time.Now()).
		Exec(ctx)
}