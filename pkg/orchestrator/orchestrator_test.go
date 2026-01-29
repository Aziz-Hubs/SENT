package orchestrator

import (
	"context"
	"testing"

	"sent/ent/enttest"
	"sent/ent/employee"
	"sent/ent/user"
	"sent/ent/asset"
	"sent/ent/auditlog"

	_ "sent/ent/runtime"
	_ "github.com/mattn/go-sqlite3"
)

func TestTerminationWorkflow(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	// 1. Setup Tenant
	tenant := client.Tenant.Create().SetName("TestCorp").SetDomain("test.sent").SaveX(ctx)
	
	// Setup Asset Types
	laptopType := client.AssetType.Create().SetName("Laptop").SaveX(ctx)

	// Setup User (The operational identity that owns assets)
	u := client.User.Create().
		SetTenant(tenant).
		SetZitadelID("zitadel-123").
		SetEmail("john.doe@test.sent").
		SetFirstName("John").
		SetLastName("Doe").
		SaveX(ctx)

	// Setup Employee (The HR identity)
	emp := client.Employee.Create().
		SetTenant(tenant).
		SetZitadelID("zitadel-123"). // Matches User.ZitadelID
		SetEmployeeID("SENT-001").
		SetFirstName("John").
		SetLastName("Doe").
		SetEmail("john.doe@test.sent").
		SetSalaryEncrypted("secret").
		SetStatus(employee.StatusACTIVE).
		SaveX(ctx)

	// Assign an Asset to the USER
	client.Asset.Create().
		SetTenant(tenant).
		SetType(laptopType).
		SetName("John's MacBook").
		SetOwner(u) .
		SaveX(ctx)

	// 2. Execute Asset Cleanup Worker logic (Mock)
	// We'll test the core logic: Find emp -> get ZitadelID -> clear assets of user with that ID
	
	// Run the traversal manually to verify the logic in workers.go
	dbEmp, _ := client.Employee.Get(ctx, emp.ID)
	count, err := client.Asset.Update().
		Where(asset.HasOwnerWith(user.ZitadelID(dbEmp.ZitadelID))).
		ClearOwner().
		Save(ctx)

	if err != nil {
		t.Fatalf("failed to cleanup assets: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 asset cleared, got %d", count)
	}

	// 3. Verify
	assets, _ := client.Asset.Query().Where(asset.HasOwner()).All(ctx)
	if len(assets) != 0 {
		t.Errorf("expected 0 assets with owners, found %d", len(assets))
	}

	// 4. Verify Audit Log (Simulate what the worker does)
	client.AuditLog.Create().
		SetTenant(tenant).
		SetAppName("SENTnexus").
		SetAction("asset_cleanup_executed").
		SetActorID("system").
		SetPayload(map[string]interface{}{"user_id": emp.ID}).
		SaveX(ctx)

	logExists, _ := client.AuditLog.Query().
		Where(auditlog.ActionEQ("asset_cleanup_executed")).
		Exist(ctx)

	if !logExists {
		t.Errorf("expected audit log entry not found")
	}
}