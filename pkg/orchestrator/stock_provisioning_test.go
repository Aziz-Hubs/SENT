package orchestrator

import (
	"context"
	"testing"
	"time"

	"sent/ent"
	"sent/ent/asset"
	"sent/ent/enttest"
	"sent/ent/tenant"
	"sent/pkg/stock"

	_ "sent/ent/runtime"
	_ "github.com/mattn/go-sqlite3"
)

func TestStockProvisioningWorkflow(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	// 1. Register Hooks
	RegisterStockHooks(client)

	// 2. Setup Tenants
	warehouseTenant := client.Tenant.Create().SetName("Main Warehouse").SetDomain("warehouse.sent").SaveX(ctx)
	targetTenant := client.Tenant.Create().SetName("Client Corp").SetDomain("client.sent").SaveX(ctx)

	// 3. Setup Product
	prod := client.Product.Create().
		SetTenant(warehouseTenant).
		SetSku("HW-SRV-001").
		SetName("Enterprise Server").
		SetQuantity(10).
		SaveX(ctx)

	// 4. Simulate SENTstock Adjustment (Outgoing to Client)
	stockBridge := stock.NewStockBridge(client)
	stockBridge.Startup(ctx)

	_, err := stockBridge.AdjustStock(stock.StockAdjustment{
		ProductID: prod.ID,
		Quantity:  1,
		Type:      "outgoing",
		Reason:    "Deployment to Client Corp",
		Metadata: map[string]interface{}{
			"target_tenant":       targetTenant.ID,
			"SerialNumber":        "SN-XYZ-789",
			"Manufacturer":        "SENT Hardware",
			"VendorSupportPhone":  "+1-800-SENT-FIX",
		},
	})

	if err != nil {
		t.Fatalf("failed to adjust stock: %v", err)
	}

	// 5. Verify Asset Creation in SENTnexus
	// Note: Provisioning happens in a goroutine, but in sqlite memory it might be near instant.
	// We might need a small retry loop or just check directly if it's fast enough.
	
	// For testing, since we use background context in goroutine, it might be tricky.
	// However, handleStockProvisioning is called in a 'go func'.
	
	// Let's wait a bit or use a channel. Since I can't easily change the code to use a channel for tests now,
	// I'll just check if it exists after a very short sleep or check if I can run it synchronously for tests.
	
	// Actually, let's just query for it.
	var provisionedAsset *ent.Asset
	found := false
	for i := 0; i < 10; i++ {
		assets, _ := client.Asset.Query().
			Where(asset.SerialNumberEQ("SN-XYZ-789")).
			Where(asset.HasTenantWith(tenant.ID(targetTenant.ID))).
			WithTenant().
			WithType().
			All(ctx)
		
		if len(assets) > 0 {
			provisionedAsset = assets[0]
			found = true
			break
		}
		time.Sleep(50 * time.Millisecond)
	}

	if !found {
		t.Errorf("expected asset not found in target tenant")
		return
	}

	// 6. Verify Data Carry-over
	if provisionedAsset.Manufacturer != "SENT Hardware" {
		t.Errorf("expected manufacturer 'SENT Hardware', got '%s'", provisionedAsset.Manufacturer)
	}
	if provisionedAsset.VendorSupportPhone != "+1-800-SENT-FIX" {
		t.Errorf("expected vendor support phone '+1-800-SENT-FIX', got '%s'", provisionedAsset.VendorSupportPhone)
	}
	if provisionedAsset.Status != asset.StatusSTAGED_FOR_DEPLOYMENT {
		t.Errorf("expected status STAGED_FOR_DEPLOYMENT, got '%s'", provisionedAsset.Status)
	}

	// Verify Asset Type
	if provisionedAsset.Edges.Type.Name != "Hardware" {
		t.Errorf("expected asset type 'Hardware', got '%s'", provisionedAsset.Edges.Type.Name)
	}

	t.Logf("Verified: Asset %d created for S/N %s", provisionedAsset.ID, provisionedAsset.SerialNumber)
}
