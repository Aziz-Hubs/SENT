package orchestrator

import (
	"context"
	"fmt"
	"log"
	"sent/ent"
	"sent/ent/asset"
	"sent/ent/assettype"
	"sent/ent/hook"
	"sent/ent/stockmovement"
	"strconv"
)

// RegisterStockHooks attaches orchestrator logic to StockMovement mutations.
func RegisterStockHooks(client *ent.Client) {
	client.StockMovement.Use(func(next ent.Mutator) ent.Mutator {
		return hook.StockMovementFunc(func(ctx context.Context, m *ent.StockMovementMutation) (ent.Value, error) {
			// Only trigger on creation of new movements
			if !m.Op().Is(ent.OpCreate) {
				return next.Mutate(ctx, m)
			}

			v, err := next.Mutate(ctx, m)
			if err != nil {
				return v, err
			}

			sm, ok := v.(*ent.StockMovement)
			if !ok {
				return v, err
			}

			// Trigger: Listen for StockMovement events where Type == OUTGOING and Metadata["target_tenant"] is present.
			if sm.MovementType == stockmovement.MovementTypeOutgoing {
				if targetTenant, exists := sm.Metadata["target_tenant"]; exists {
					// We use a background context to ensure provisioning happens even if the original request finishes,
					// though in this monolith, they are often the same.
					go func() {
						err := handleStockProvisioning(context.Background(), client, sm, targetTenant)
						if err != nil {
							log.Printf("[ORCHESTRATOR] Provisioning failed: %v", err)
						}
					}()
				}
			}

			return v, err
		})
	})
}

// handleStockProvisioning creates a "Digital Twin" in SENTnexus.
func handleStockProvisioning(ctx context.Context, client *ent.Client, sm *ent.StockMovement, targetTenant interface{}) error {
	// 1. Resolve Target Tenant ID
	var tenantID int
	switch v := targetTenant.(type) {
	case float64:
		tenantID = int(v)
	case string:
		tenantID, _ = strconv.Atoi(v)
	case int:
		tenantID = v
	}

	if tenantID == 0 {
		return fmt.Errorf("invalid target_tenant ID: %v", targetTenant)
	}

	// 2. Resolve Product details
	prodID, err := sm.QueryProduct().OnlyID(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch product ID: %w", err)
	}
	prod, err := client.Product.Get(ctx, prodID)
	if err != nil {
		return fmt.Errorf("failed to fetch product: %w", err)
	}

	// 3. Ensure "Hardware" AssetType exists
	at, err := client.AssetType.Query().Where(assettype.NameEQ("Hardware")).Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			at, err = client.AssetType.Create().SetName("Hardware").SetDescription("Physical hardware items from warehouse").Save(ctx)
			if err != nil {
				return fmt.Errorf("failed to create 'Hardware' asset type: %w", err)
			}
		} else {
			return fmt.Errorf("failed to query asset type: %w", err)
		}
	}

	// 4. Extract data from metadata
	serialNumber, _ := sm.Metadata["SerialNumber"].(string)
	manufacturer, _ := sm.Metadata["Manufacturer"].(string)
	vendorSupport, _ := sm.Metadata["VendorSupportPhone"].(string)

	// 5. Create the Asset in SENTnexus
	// Initial status is set to STAGED_FOR_DEPLOYMENT
	_, err = client.Asset.Create().
		SetTenantID(tenantID).
		SetType(at).
		SetName(fmt.Sprintf("%s (%s)", prod.Name, serialNumber)).
		SetSerialNumber(serialNumber).
		SetManufacturer(manufacturer).
		SetVendorSupportPhone(vendorSupport).
		SetStatus(asset.StatusSTAGED_FOR_DEPLOYMENT).
		SetProduct(prod).
		Save(ctx)

	if err != nil {
		return fmt.Errorf("failed to create asset in nexus: %w", err)
	}

	log.Printf("[ORCHESTRATOR] Digital Twin created for S/N: %s in Tenant %d", serialNumber, tenantID)
	return nil
}
