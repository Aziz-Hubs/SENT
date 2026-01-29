package database

import (
	"context"
	"testing"

	"sent/ent/enttest"

	_ "github.com/mattn/go-sqlite3"
)

func TestLogAuditRecord(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	// Setup: Tenant
	tenant := client.Tenant.Create().SetName("AuditOrg").SetDomain("audit.org").SaveX(ctx)

	// Test logging
	payload := map[string]interface{}{"test": "data"}
	err := LogAuditRecord(ctx, client, tenant.ID, "TestApp", "test_action", "actor-123", payload)
	if err != nil {
		t.Fatalf("failed to log audit record: %v", err)
	}

	// Verify
	log, err := client.AuditLog.Query().Only(ctx)
	if err != nil {
		t.Fatalf("failed to query audit log: %v", err)
	}

	if log.AppName != "TestApp" || log.Action != "test_action" || log.ActorID != "actor-123" {
		t.Errorf("logged data mismatch")
	}
}
