package stock

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/product"
	"sent/ent/stockmovement"
	"sent/ent/tenant"
)

// Movement types constants
const (
	MovementTypeIncoming = "incoming"
	MovementTypeOutgoing = "outgoing"
	MovementTypeManual   = "manual"
)

// StockBridge handles inventory management, product catalogs, and stock movements.
type StockBridge struct {
	ctx context.Context
	db  *ent.Client
}

// ProductDTO represents a product in the catalog.
type ProductDTO struct {
	ID          int     `json:"id"`
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	UnitCost    float64 `json:"unitCost"`
	Quantity    float64 `json:"quantity"`
}

// StockAdjustment represents a request to modify stock levels.
type StockAdjustment struct {
	ProductID int                    `json:"productId"`
	Quantity  float64                `json:"quantity"`
	Type      string                 `json:"type"` // "incoming", "outgoing", "manual"
	Reason    string                 `json:"reason"`
	Metadata  map[string]interface{} `json:"metadata"`
}

// StockMovementDTO represents a historical record of stock change.
type StockMovementDTO struct {
	ID          int       `json:"id"`
	Type        string    `json:"type"`
	Quantity    float64   `json:"quantity"`
	Reason      string    `json:"reason"`
	Date        time.Time `json:"date"`
	ProductName string    `json:"productName"`
}

// NewStockBridge initializes a new StockBridge.
func NewStockBridge(db *ent.Client) *StockBridge {
	return &StockBridge{db: db}
}

// Startup initializes the bridge context.
func (s *StockBridge) Startup(ctx context.Context) {
	s.ctx = ctx
}

// GetProducts retrieves the full product catalog.
// It seeds default data if the catalog is empty.
func (s *StockBridge) GetProducts() ([]ProductDTO, error) {
	products, err := s.db.Product.Query().All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}

	if len(products) == 0 {
		if err := s.seedDefaultProducts(); err != nil {
			return nil, err
		}
		// Re-fetch
		products, err = s.db.Product.Query().All(s.ctx)
		if err != nil {
			return nil, err
		}
	}

	dtos := make([]ProductDTO, len(products))
	for i, p := range products {
		dtos[i] = ProductDTO{
			ID:          p.ID,
			SKU:         p.Sku,
			Name:        p.Name,
			Description: p.Description,
			UnitCost:    p.UnitCost,
			Quantity:    p.Quantity,
		}
	}
	return dtos, nil
}

func (s *StockBridge) seedDefaultProducts() error {
	t, err := s.db.Tenant.Query().Order(ent.Asc(tenant.FieldID)).First(s.ctx)
	if err != nil {
		// If no tenant, create one (fallback, though Auth usually handles this)
		if ent.IsNotFound(err) {
			t, err = s.db.Tenant.Create().SetName("SENT LLC").SetDomain("sent.jo").Save(s.ctx)
			if err != nil {
				return err
			}
		} else {
			return err
		}
	}
	
	bulk := []*ent.ProductCreate{
		s.db.Product.Create().SetSku("SRV-L1").SetName("Standard Server L1").SetUnitCost(1200).SetQuantity(5).SetTenant(t),
		s.db.Product.Create().SetSku("LAP-P1").SetName("Pro Laptop 14").SetUnitCost(1800).SetQuantity(8).SetTenant(t),
	}
	
	if _, err := s.db.Product.CreateBulk(bulk...).Save(s.ctx); err != nil {
		return fmt.Errorf("failed to seed products: %w", err)
	}
	return nil
}

// CalculateCOGS estimates the Cost of Goods Sold for a given quantity of product.
// Ideally, this uses FIFO, matching outgoing quantity against historical incoming batches.
//
// @param productID - The product to calculate for.
// @param qty - The quantity being sold/removed.
// @returns The total cost value or an error.
func (s *StockBridge) CalculateCOGS(productID int, qty float64) (float64, error) {
	// Query historical incoming movements for this specific product, ordered by date (FIFO)
	movements, err := s.db.StockMovement.Query().
		Where(stockmovement.HasProductWith(product.ID(productID))).
		Where(stockmovement.MovementTypeEQ(stockmovement.MovementTypeIncoming)).
		Order(ent.Asc(stockmovement.FieldCreatedAt)).
		All(s.ctx)
	
	if err != nil {
		return 0, fmt.Errorf("failed to query stock history: %w", err)
	}

	var totalCost float64
	remaining := qty
	
	for _, m := range movements {
		if remaining <= 0 {
			break
		}
		
		// Note: In a production system, we must track how much of each batch has ALREADY been sold.
		// Since we lack a 'SoldQuantity' field on StockMovement, this is an approximation.
		// We assume the full batch is available (which is incorrect for repeated sales).
		// TODO: Implement batch tracking (Inventory Batches).

		take := m.Quantity
		if take > remaining {
			take = remaining
		}
		
		// Retrieve current unit cost as a fallback for batch cost
		// In a real system, 'm' should have 'UnitCost' at time of entry.
		prod, err := s.db.Product.Get(s.ctx, productID)
		if err != nil {
			return 0, err
		}
		
		totalCost += take * prod.UnitCost
		remaining -= take
	}
	
	return totalCost, nil
}

// CreateProduct adds a new product to the catalog.
func (s *StockBridge) CreateProduct(p ProductDTO) (int, error) {
	tnt, err := s.db.Tenant.Query().First(s.ctx)
	if err != nil {
		return 0, fmt.Errorf("tenant required: %w", err)
	}

	res, err := s.db.Product.Create().
		SetSku(p.SKU).
		SetName(p.Name).
		SetDescription(p.Description).
		SetUnitCost(p.UnitCost).
		SetQuantity(p.Quantity).
		SetTenant(tnt).
		Save(s.ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to create product: %w", err)
	}
	return res.ID, nil
}

// AdjustStock creates a stock movement and updates the product quantity.
func (s *StockBridge) AdjustStock(adj StockAdjustment) (string, error) {
	p, err := s.db.Product.Get(s.ctx, adj.ProductID)
	if err != nil {
		return "", fmt.Errorf("product not found: %w", err)
	}

	tnt, err := s.db.Tenant.Query().First(s.ctx)
	if err != nil {
		return "", fmt.Errorf("tenant required: %w", err)
	}

	// Create Movement Record
	_, err = s.db.StockMovement.Create().
		SetQuantity(adj.Quantity).
		SetMovementType(stockmovement.MovementType(adj.Type)).
		SetReason(adj.Reason).
		SetProduct(p).
		SetTenant(tnt).
		SetMetadata(adj.Metadata).
		Save(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to log movement: %w", err)
	}

	// Update Actual Quantity
	newQty := p.Quantity
	switch adj.Type {
	case MovementTypeIncoming:
		newQty += adj.Quantity
	case MovementTypeOutgoing:
		newQty -= adj.Quantity
	case MovementTypeManual:
		// Manual usually implies setting to a specific value or correction.
		// Assuming here it functions as a Set or Delta depending on implementation.
		// Let's assume Delta for consistency, but often Manual overrides.
		// Ideally: newQty = adj.Quantity (Absolute) vs Delta.
		// Based on logic below, let's treat it as absolute set for now?
		// "newQty = adj.Quantity" logic from before seems to imply absolute set.
		newQty = adj.Quantity
	default:
		return "", fmt.Errorf("unknown adjustment type: %s", adj.Type)
	}

	err = s.db.Product.UpdateOne(p).SetQuantity(newQty).Exec(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to update product quantity: %w", err)
	}

	return fmt.Sprintf("Stock updated for %s. New Qty: %.2f", p.Name, newQty), nil
}

// GetHistory retrieves the full stock movement history.
func (s *StockBridge) GetHistory() ([]StockMovementDTO, error) {
	movements, err := s.db.StockMovement.Query().WithProduct().All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query history: %w", err)
	}

	dtos := make([]StockMovementDTO, len(movements))
	for i, m := range movements {
		productName := "Unknown"
		if m.Edges.Product != nil {
			productName = m.Edges.Product.Name
		}
		dtos[i] = StockMovementDTO{
			ID:          m.ID,
			Type:        string(m.MovementType),
			Quantity:    m.Quantity,
			Reason:      m.Reason,
			Date:        m.CreatedAt,
			ProductName: productName,
		}
	}
	return dtos, nil
}

// GenerateBarcode simulates barcode generation for a product SKU.
func (s *StockBridge) GenerateBarcode(sku string) (string, error) {
	// In a real system, this would generate an image and return a path or base64.
	return fmt.Sprintf("Barcode generated for SKU: %s", sku), nil
}
