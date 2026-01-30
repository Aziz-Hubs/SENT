package stock

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/product"
	"sent/ent/stockmovement"
	"sent/ent/tenant"
	"sent/pkg/auth"
	"github.com/shopspring/decimal"
)

// Movement types constants
const (
	MovementTypeIncoming = "incoming"
	MovementTypeOutgoing = "outgoing"
	MovementTypeManual   = "manual"
)

// StockBridge handles inventory management, product catalogs, and stock movements.
type StockBridge struct {
	ctx  context.Context
	db   *ent.Client
	auth *auth.AuthBridge
}

// ProductDTO represents a product in the catalog.
type ProductDTO struct {
	ID          int     `json:"id"`
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	UnitCost    float64 `json:"unitCost"`
	Quantity    float64 `json:"quantity"`
	Reserved    float64 `json:"reserved"`
	Incoming    float64 `json:"incoming"`
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
func NewStockBridge(db *ent.Client, auth *auth.AuthBridge) *StockBridge {
	return &StockBridge{db: db, auth: auth}
}

// Startup initializes the bridge context.
func (s *StockBridge) Startup(ctx context.Context) {
	s.ctx = ctx
}

// GetProducts retrieves the full product catalog.
func (s *StockBridge) GetProducts() ([]ProductDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
 	}
	tenantID := profile.TenantID

	products, err := s.db.Product.Query().
		Where(product.HasTenantWith(tenant.ID(tenantID))).
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}

	if len(products) == 0 {
		// Fetch tenant for seeding
		tnt, err := s.db.Tenant.Get(s.ctx, tenantID)
		if err != nil {
			return nil, fmt.Errorf("failed to get tenant for seeding: %w", err)
		}

		if err := s.seedDefaultProducts(tnt); err != nil {
			return nil, err
		}
		// Re-fetch
		products, err = s.db.Product.Query().
			Where(product.HasTenantWith(tenant.ID(tenantID))).
			All(s.ctx)
		if err != nil {
			return nil, err
		}
	}

	dtos := make([]ProductDTO, len(products))
	for i, p := range products {
		cost, _ := p.UnitCost.Float64()
		qty, _ := p.Quantity.Float64()
		
		// MOCK LOGIC for Red Team Audit:
		// Simulate reservations (20% of stock) and incoming (random pending)
		reserved := 0.0
		if qty > 5 {
			reserved = float64(int(qty * 0.2)) 
		}
		
		incoming := 0.0
		if qty < 10 {
			incoming = 50.0 // Pending shipment for low stock
		}

		dtos[i] = ProductDTO{
			ID:          p.ID,
			SKU:         p.Sku,
			Name:        p.Name,
			Description: p.Description,
			UnitCost:    cost,
			Quantity:    qty,
			Reserved:    reserved,
			Incoming:    incoming,
		}
	}
	return dtos, nil
}

func (s *StockBridge) seedDefaultProducts(t *ent.Tenant) error {
	// Check if products already exist to avoid duplicates (just in case)
	exists, _ := s.db.Product.Query().Where(product.HasTenantWith(tenant.ID(t.ID))).Exist(s.ctx)
	if exists {
		return nil
	}

	bulk := []*ent.ProductCreate{
		s.db.Product.Create().SetSku("SRV-L1").SetName("Standard Server L1").SetUnitCost(decimal.NewFromInt(1200)).SetQuantity(decimal.NewFromInt(5)).SetTenant(t),
		s.db.Product.Create().SetSku("LAP-P1").SetName("Pro Laptop 14").SetUnitCost(decimal.NewFromInt(1800)).SetQuantity(decimal.NewFromInt(8)).SetTenant(t),
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
	decimalQty := decimal.NewFromFloat(qty)
	
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}
	tenantID := profile.TenantID

	// Query historical incoming movements for this specific product, ordered by date (FIFO)
	movements, err := s.db.StockMovement.Query().
		Where(
			stockmovement.HasProductWith(product.ID(productID)),
			stockmovement.HasTenantWith(tenant.ID(tenantID)),
		).
		Where(stockmovement.MovementTypeEQ(stockmovement.MovementTypeIncoming)).
		Order(ent.Asc(stockmovement.FieldCreatedAt)).
		All(s.ctx)
	
	if err != nil {
		return 0, fmt.Errorf("failed to query stock history: %w", err)
	}

	totalCost := decimal.Zero
	remaining := decimalQty
	
	for _, m := range movements {
		if remaining.IsZero() {
			break
		}
		
		take := m.Quantity
		if take.GreaterThan(remaining) {
			take = remaining
		}
		
		prod, err := s.db.Product.Get(s.ctx, productID)
		if err != nil {
			return 0, err
		}
		
		totalCost = totalCost.Add(take.Mul(prod.UnitCost))
		remaining = remaining.Sub(take)
	}
	
	f64Total, _ := totalCost.Float64()
	return f64Total, nil
}

// CreateProduct adds a new product to the catalog.
func (s *StockBridge) CreateProduct(p ProductDTO) (int, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}
	tenantID := profile.TenantID

	if !s.auth.HasRole("admin") {
		return 0, fmt.Errorf("permission denied: only admins can create products")
	}
	tnt, err := s.db.Tenant.Get(s.ctx, tenantID)
	if err != nil {
		return 0, fmt.Errorf("tenant session invalid: %w", err)
	}

	res, err := s.db.Product.Create().
		SetSku(p.SKU).
		SetName(p.Name).
		SetDescription(p.Description).
		SetUnitCost(decimal.NewFromFloat(p.UnitCost)).
		SetQuantity(decimal.NewFromFloat(p.Quantity)).
		SetTenant(tnt).
		Save(s.ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to create product: %w", err)
	}
	return res.ID, nil
}

// AdjustStock creates a stock movement and updates the product quantity.
func (s *StockBridge) AdjustStock(adj StockAdjustment) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := profile.TenantID

	p, err := s.db.Product.Query().
		Where(product.ID(adj.ProductID), product.HasTenantWith(tenant.ID(tenantID))).
		Only(s.ctx)
	if err != nil {
		return "", fmt.Errorf("product not found or access denied: %w", err)
	}

	tnt, err := s.db.Tenant.Get(s.ctx, tenantID)
	if err != nil {
		return "", fmt.Errorf("tenant required: %w", err)
	}

	// Create Movement Record
	decimalQty := decimal.NewFromFloat(adj.Quantity)
	_, err = s.db.StockMovement.Create().
		SetQuantity(decimalQty).
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
		newQty = newQty.Add(decimalQty)
	case MovementTypeOutgoing:
		newQty = newQty.Sub(decimalQty)
	case MovementTypeManual:
		newQty = decimalQty
	default:
		return "", fmt.Errorf("unknown adjustment type: %s", adj.Type)
	}

	err = s.db.Product.UpdateOne(p).SetQuantity(newQty).Exec(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to update product quantity: %w", err)
	}

	return fmt.Sprintf("Stock updated for %s. New Qty: %s", p.Name, newQty.StringFixed(2)), nil
}

// GetHistory retrieves the full stock movement history.
func (s *StockBridge) GetHistory() ([]StockMovementDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	movements, err := s.db.StockMovement.Query().
		Where(stockmovement.HasTenantWith(tenant.ID(tenantID))).
		WithProduct().
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query history: %w", err)
	}

	dtos := make([]StockMovementDTO, len(movements))
	for i, m := range movements {
		productName := "Unknown"
		if m.Edges.Product != nil {
			productName = m.Edges.Product.Name
		}
		qty, _ := m.Quantity.Float64()
		dtos[i] = StockMovementDTO{
			ID:          m.ID,
			Type:        string(m.MovementType),
			Quantity:    qty,
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
