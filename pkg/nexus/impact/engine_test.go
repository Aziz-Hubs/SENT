package impact

import (
	"context"
	"testing"

	"sent/ent/enttest"
	_ "sent/ent/runtime"

	_ "github.com/mattn/go-sqlite3"
)

func TestCalculateBlastRadius(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	// Setup: Tenant
	tenant := client.Tenant.Create().SetName("TestOrg").SetDomain("test.org").SaveX(ctx)

	// Setup: Asset Types
	serverType := client.AssetType.Create().SetName("Server").SaveX(ctx)
	dbType := client.AssetType.Create().SetName("Database").SaveX(ctx)
	appType := client.AssetType.Create().SetName("Application").SaveX(ctx)

	// Setup: Graph
	// Server -> hosts -> App -> depends_on -> DB
	srv := client.Asset.Create().SetTenant(tenant).SetType(serverType).SetName("Server-01").SaveX(ctx)
	app := client.Asset.Create().SetTenant(tenant).SetType(appType).SetName("App-01").SaveX(ctx)
	db := client.Asset.Create().SetTenant(tenant).SetType(dbType).SetName("DB-01").SaveX(ctx)

	// Link them using update since some methods might be missing in create due to reflexive edge complexity
	client.Asset.UpdateOne(srv).AddHostedAssets(app).ExecX(ctx)
	client.Asset.UpdateOne(app).AddDependsOn(db).ExecX(ctx)

	engine := NewEngine(client)

	// Test 1: Impact of DB failure (should affect App)
	impact, err := engine.CalculateBlastRadius(ctx, db.ID, 3)
	if err != nil {
		t.Fatalf("failed to calculate impact: %v", err)
	}

	if len(impact) != 1 {
		t.Errorf("expected 1 impacted node, got %d", len(impact))
	} else if impact[0].ID != app.ID {
		t.Errorf("expected App-01 to be impacted, got %s", impact[0].Name)
	}
}