package stock

import (
	"context"
	"fmt"
	"time"
	"strings"

	"sent/ent"
	"sent/ent/product"
	"sent/ent/stockmovement"
	"sent/ent/tenant"
	"sent/ent/supplier"
	"sent/ent/category"
	"sent/ent/employee"
	"sent/ent/assetassignment"
	"sent/ent/stockauditlog"
	"sent/ent/maintenanceschedule"
	"sent/ent/stockalert"
	"sent/ent/purchaseorder"
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
	SupplierName string  `json:"supplierName"`
	CategoryName string  `json:"categoryName"`
	Barcode      string  `json:"barcode"`
	MinStock     int     `json:"minStock"`
	SerialNumber string  `json:"serialNumber"`
	PurchaseDate time.Time `json:"purchaseDate"`
	PurchasePrice float64 `json:"purchasePrice"`
	UsefulLifeMonths int `json:"usefulLifeMonths"`
	WarrantyExpiresAt time.Time `json:"warrantyExpiresAt"`
	IsDisposed    bool `json:"isDisposed"`
	CurrentValue  float64 `json:"currentValue"`
	Location      string `json:"location"`
}

type SupplierDTO struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type CategoryDTO struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

type EmployeeDTO struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type AssignmentDTO struct {
	ID           int       `json:"id"`
	EmployeeName string    `json:"employeeName"`
	AssignedAt   time.Time `json:"assignedAt"`
	Status       string    `json:"status"`
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

type AuditLogDTO struct {
	ID         int       `json:"id"`
	Action     string    `json:"action"`
	EntityType string    `json:"entityType"`
	EntityID   int       `json:"entityID"`
	UserName   string    `json:"userName"`
	Details    string    `json:"details"`
	CreatedAt  time.Time `json:"createdAt"`
}

type MaintenanceScheduleDTO struct {
	ID          int       `json:"id"`
	ProductID   int       `json:"productID"`
	ProductName string    `json:"productName"`
	ScheduledAt time.Time `json:"scheduledAt"`
	CompletedAt time.Time `json:"completedAt"`
	Status      string    `json:"status"`
	Notes       string    `json:"notes"`
}

type StockAlertDTO struct {
	ID        int       `json:"id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
	ProductID int       `json:"productID"`
}

type PurchaseOrderDTO struct {
	ID           int       `json:"id"`
	PONumber     string    `json:"poNumber"`
	SupplierID   int       `json:"supplierID"`
	SupplierName string    `json:"supplierName"`
	Status       string    `json:"status"`
	OrderDate    time.Time `json:"orderDate"`
	ExpectedDate time.Time `json:"expectedDate"`
	TotalAmount  float64   `json:"totalAmount"`
	Lines        []PurchaseOrderLineDTO `json:"lines"`
}

type PurchaseOrderLineDTO struct {
	ID          int     `json:"id"`
	ProductID   int     `json:"productID"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitCost    float64 `json:"unitCost"`
	ReceivedQty int     `json:"receivedQty"`
}

type InventoryCountDTO struct {
	ID         int       `json:"id"`
	ProductID  int       `json:"productID"`
	ProductName string    `json:"productName"`
	CountedQty float64   `json:"countedQty"`
	SystemQty  float64   `json:"systemQty"`
	Variance   float64   `json:"variance"`
	CountedAt  time.Time `json:"countedAt"`
	CountedBy  string    `json:"countedBy"`
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
		WithSupplier().
		WithCategory().
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
			WithSupplier().
			WithCategory().
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
			MinStock:    p.MinStockLevel,
			Barcode:     p.Barcode,
			SerialNumber: p.SerialNumber,
			PurchaseDate: p.PurchaseDate,
			UsefulLifeMonths: p.UsefulLifeMonths,
			IsDisposed:   p.IsDisposed,
			Location:     p.Location,
		}
		
		if !p.PurchasePrice.IsZero() {
			dtos[i].PurchasePrice, _ = p.PurchasePrice.Float64()
			// Calculate Depreciation (Simplified Straight-Line)
			if !p.PurchaseDate.IsZero() && p.UsefulLifeMonths > 0 {
				elapsed := time.Since(p.PurchaseDate).Hours() / 24 / 30
				if elapsed < 0 { elapsed = 0 }
				factor := elapsed / float64(p.UsefulLifeMonths)
				if factor > 1 { factor = 1 }
				dtos[i].CurrentValue = dtos[i].PurchasePrice * (1 - factor)
			} else {
				dtos[i].CurrentValue = dtos[i].PurchasePrice
			}
		}

		if !p.WarrantyExpiresAt.IsZero() {
			dtos[i].WarrantyExpiresAt = p.WarrantyExpiresAt
		}

		if p.Edges.Supplier != nil {
			dtos[i].SupplierName = p.Edges.Supplier.Name
		}
		if p.Edges.Category != nil {
			dtos[i].CategoryName = p.Edges.Category.Name
		}
	}
	return dtos, nil
}

// LogAudit internal helper for audit trail.
func (s *StockBridge) logAudit(action, entityType string, entityID int, details map[string]interface{}) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return
	}
	
	_, _ = s.db.StockAuditLog.Create().
		SetTenantID(profile.TenantID).
		SetAction(action).
		SetEntityType(entityType).
		SetEntityID(entityID).
		SetUserName(profile.Name).
		SetDetails(details).
		Save(s.ctx)
}

// GetAuditLogs retrieves history for a product or general stock.
func (s *StockBridge) GetAuditLogs(entityType string, entityID int) ([]AuditLogDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	
	query := s.db.StockAuditLog.Query().
		Where(stockauditlog.HasTenantWith(tenant.ID(profile.TenantID)))
		
	if entityType != "" {
		query = query.Where(stockauditlog.EntityTypeEQ(entityType))
	}
	if entityID > 0 {
		query = query.Where(stockauditlog.EntityIDEQ(entityID))
	}
	
	logs, err := query.Order(ent.Desc(stockauditlog.FieldCreatedAt)).Limit(100).All(s.ctx)
	if err != nil {
		return nil, err
	}
	
	dtos := make([]AuditLogDTO, len(logs))
	for i, l := range logs {
		dtos[i] = AuditLogDTO{
			ID: l.ID,
			Action: l.Action,
			EntityType: l.EntityType,
			EntityID: l.EntityID,
			UserName: l.UserName,
			CreatedAt: l.CreatedAt,
		}
		// Convert details map to simple string for DTO
		dtos[i].Details = fmt.Sprintf("%v", l.Details)
	}
	return dtos, nil
}

// GetExpiringWarranties returns products with warranties expiring within X days.
func (s *StockBridge) GetExpiringWarranties(days int) ([]ProductDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	
	threshold := time.Now().AddDate(0, 0, days)
	
	products, err := s.db.Product.Query().
		Where(
			product.HasTenantWith(tenant.ID(profile.TenantID)),
			product.WarrantyExpiresAtLT(threshold),
			product.WarrantyExpiresAtGT(time.Now()),
		).
		All(s.ctx)
	
	if err != nil {
		return nil, err
	}
	
	// Convert to DTOs (stripped down for report)
	dtos := make([]ProductDTO, len(products))
	for i, p := range products {
		dtos[i] = ProductDTO{
			ID: p.ID,
			SKU: p.Sku,
			Name: p.Name,
			WarrantyExpiresAt: p.WarrantyExpiresAt,
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

// GetSuppliers lists all suppliers.
func (s *StockBridge) GetSuppliers() ([]SupplierDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	list, err := s.db.Supplier.Query().
		Where(supplier.HasTenantWith(tenant.ID(profile.TenantID))).
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list suppliers: %w", err)
	}

	dtos := make([]SupplierDTO, len(list))
	for i, v := range list {
		dtos[i] = SupplierDTO{ID: v.ID, Name: v.Name}
	}
	return dtos, nil
}

// GetCategories lists all categories.
func (s *StockBridge) GetCategories() ([]CategoryDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	list, err := s.db.Category.Query().
		Where(category.HasTenantWith(tenant.ID(profile.TenantID))).
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}

	dtos := make([]CategoryDTO, len(list))
	for i, v := range list {
		dtos[i] = CategoryDTO{ID: v.ID, Name: v.Name, Type: string(v.Type)}
	}
	return dtos, nil
}

// AssignAsset assigns a product unit to an employee (Check-out).
func (s *StockBridge) AssignAsset(productID int, employeeID int, reason string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tnt, err := s.db.Tenant.Get(s.ctx, profile.TenantID)
	if err != nil {
		return "", err
	}

	// 1. Get Product
	p, err := s.db.Product.Query().
		Where(product.ID(productID), product.HasTenantWith(tenant.ID(tnt.ID))).
		Only(s.ctx)
	if err != nil {
		return "", fmt.Errorf("product not found: %w", err)
	}

	qty, _ := p.Quantity.Float64()
	if qty < 1 {
		return "", fmt.Errorf("insufficient stock to assign asset")
	}

	// 2. Create Assignment
	_, err = s.db.AssetAssignment.Create().
		SetTenant(tnt).
		SetProduct(p).
		SetEmployeeID(employeeID).
		SetStatus(assetassignment.StatusActive).
		SetAssignedAt(time.Now()).
		Save(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to create assignment: %w", err)
	}

	// 3. Decrement Stock (Log Movement)
	// We treat assignment as "Outgoing" from the Stock Room perspective
	err = s.db.StockMovement.Create().
		SetTenant(tnt).
		SetProduct(p).
		SetMovementType(stockmovement.MovementTypeOutgoing).
		SetQuantity(decimal.NewFromInt(1)).
		SetReason(fmt.Sprintf("Assigned to Employee #%d: %s", employeeID, reason)).
		Exec(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to log movement: %w", err)
	}

	// Update product quantity
	newQty := p.Quantity.Sub(decimal.NewFromInt(1))
	err = s.db.Product.UpdateOne(p).SetQuantity(newQty).Exec(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to update stock count: %w", err)
	}

	return "Asset assigned successfully", nil
}

// GetEmployees lists all employees for assignment.
func (s *StockBridge) GetEmployees() ([]EmployeeDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tnt, err := s.db.Tenant.Get(s.ctx, profile.TenantID)
	if err != nil {
		return nil, err
	}

	list, err := s.db.Employee.Query().
		Where(employee.HasTenantWith(tenant.ID(tnt.ID))).
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list employees: %w", err)
	}

	dtos := make([]EmployeeDTO, len(list))
	for i, e := range list {
		dtos[i] = EmployeeDTO{ID: e.ID, Name: e.FirstName + " " + e.LastName}
	}
	return dtos, nil
}

// GetProductAssignments lists active assignments for a product.
func (s *StockBridge) GetProductAssignments(productID int) ([]AssignmentDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tnt, err := s.db.Tenant.Get(s.ctx, profile.TenantID)
	if err != nil {
		return nil, err
	}

	assignments, err := s.db.AssetAssignment.Query().
		Where(
			assetassignment.HasProductWith(product.ID(productID)),
			assetassignment.HasTenantWith(tenant.ID(tnt.ID)),
			assetassignment.StatusEQ(assetassignment.StatusActive),
		).
		WithEmployee().
		All(s.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list assignments: %w", err)
	}

	dtos := make([]AssignmentDTO, len(assignments))
	for i, a := range assignments {
		empName := "Unknown"
		if a.Edges.Employee != nil {
			empName = a.Edges.Employee.FirstName + " " + a.Edges.Employee.LastName
		}
		dtos[i] = AssignmentDTO{
			ID:           a.ID,
			EmployeeName: empName,
			AssignedAt:   a.AssignedAt,
			Status:       string(a.Status),
		}
	}
	return dtos, nil
}

// ReturnAsset processes an asset return from an employee.
func (s *StockBridge) ReturnAsset(assignmentID int, notes string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tnt, err := s.db.Tenant.Get(s.ctx, profile.TenantID)
	if err != nil {
		return "", err
	}

	// 1. Get Assignment
	assignment, err := s.db.AssetAssignment.Query().
		Where(assetassignment.ID(assignmentID), assetassignment.HasTenantWith(tenant.ID(tnt.ID))).
		WithProduct().
		WithEmployee().
		Only(s.ctx)
	if err != nil {
		return "", fmt.Errorf("assignment not found: %w", err)
	}

	if assignment.Status == assetassignment.StatusReturned {
		return "", fmt.Errorf("asset already returned")
	}

	// 2. Update Assignment Status
	_, err = s.db.AssetAssignment.UpdateOne(assignment).
		SetStatus(assetassignment.StatusReturned).
		SetReturnedAt(time.Now()).
		Save(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to update assignment: %w", err)
	}

	// 3. Increment Stock (Incoming)
	prod := assignment.Edges.Product
	newQty := prod.Quantity.Add(decimal.NewFromInt(1))
	err = s.db.Product.UpdateOne(prod).SetQuantity(newQty).Exec(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to restore stock: %w", err)
	}

	// 4. Log Movement
	empName := "Unknown Employee"
	if assignment.Edges.Employee != nil {
		empName = assignment.Edges.Employee.FirstName + " " + assignment.Edges.Employee.LastName
	}

	_, err = s.db.StockMovement.Create().
		SetTenant(tnt).
		SetProduct(prod).
		SetMovementType(stockmovement.MovementTypeIncoming).
		SetQuantity(decimal.NewFromInt(1)).
		SetReason(fmt.Sprintf("Returned by %s. Notes: %s", empName, notes)).
		Save(s.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to log return movement: %w", err)
	}

	return "Asset returned successfully", nil
}

// CreateSupplier adds a new supplier.
func (s *StockBridge) CreateSupplier(name string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	_, err = s.db.Supplier.Create().
		SetTenantID(profile.TenantID).
		SetName(name).
		Save(s.ctx)
	if err != nil {
		return "", err
	}
	return "Supplier created", nil
}

// CreateCategory adds a new category.
func (s *StockBridge) CreateCategory(name string, catType string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	
	// Validate type from enum but simple string cast for now
	cType := category.Type(catType)
	
	_, err = s.db.Category.Create().
		SetTenantID(profile.TenantID).
		SetName(name).
		SetType(cType).
		Save(s.ctx)
	if err != nil {
		return "", err
	}
	return "Category created", nil
}

// ScheduleMaintenance records a future maintenance need.
func (s *StockBridge) ScheduleMaintenance(productID int, date time.Time, notes string) error {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return err
	}
	
	p, err := s.db.Product.Get(s.ctx, productID)
	if err != nil {
		return err
	}
	
	_, err = s.db.MaintenanceSchedule.Create().
		SetTenantID(profile.TenantID).
		SetProduct(p).
		SetScheduledAt(date).
		SetNotes(notes).
		SetStatus(maintenanceschedule.StatusPending).
		Save(s.ctx)
		
	s.logAudit("schedule_maintenance", "product", productID, map[string]interface{}{"date": date, "notes": notes})
	return err
}

// GetPendingMaintenance returns all upcoming maintenance tasks.
func (s *StockBridge) GetPendingMaintenance() ([]MaintenanceScheduleDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	
	tasks, err := s.db.MaintenanceSchedule.Query().
		Where(
			maintenanceschedule.HasTenantWith(tenant.ID(profile.TenantID)),
			maintenanceschedule.StatusEQ("pending"),
		).
		WithProduct().
		All(s.ctx)
	if err != nil {
		return nil, err
	}
	
	dtos := make([]MaintenanceScheduleDTO, len(tasks))
	for i, t := range tasks {
		dtos[i] = MaintenanceScheduleDTO{
			ID: t.ID,
			ProductID: t.Edges.Product.ID,
			ProductName: t.Edges.Product.Name,
			ScheduledAt: t.ScheduledAt,
			Status: string(t.Status),
			Notes: t.Notes,
		}
	}
	return dtos, nil
}

// CompleteMaintenance marks a task as finished.
func (s *StockBridge) CompleteMaintenance(id int) error {
	err := s.db.MaintenanceSchedule.UpdateOneID(id).
		SetStatus(maintenanceschedule.StatusCompleted).
		SetCompletedAt(time.Now()).
		Exec(s.ctx)
		
	s.logAudit("complete_maintenance", "maintenance_schedule", id, nil)
	return err
}

// GetAlerts returns active stock alerts.
func (s *StockBridge) GetAlerts() ([]StockAlertDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	
	alerts, err := s.db.StockAlert.Query().
		Where(
			stockalert.HasTenantWith(tenant.ID(profile.TenantID)),
			stockalert.IsReadEQ(false),
		).
		WithProduct().
		All(s.ctx)
	if err != nil {
		return nil, err
	}
	
	dtos := make([]StockAlertDTO, len(alerts))
	for i, a := range alerts {
		dtos[i] = StockAlertDTO{
			ID: a.ID,
			Type: string(a.AlertType),
			Message: a.Message,
			CreatedAt: a.CreatedAt,
		}
		if a.Edges.Product != nil {
			dtos[i].ProductID = a.Edges.Product.ID
		}
	}
	return dtos, nil
}

// MarkAlertRead dismisses an alert.
func (s *StockBridge) MarkAlertRead(id int) error {
	return s.db.StockAlert.UpdateOneID(id).SetIsRead(true).Exec(s.ctx)
}

// CreatePurchaseOrder generates a new PO for a supplier.
func (s *StockBridge) CreatePurchaseOrder(supplierID int, items []PurchaseOrderLineDTO) (int, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}
	
	supp, err := s.db.Supplier.Get(s.ctx, supplierID)
	if err != nil {
		return 0, err
	}
	
	po, err := s.db.PurchaseOrder.Create().
		SetTenantID(profile.TenantID).
		SetSupplier(supp).
		SetPoNumber(fmt.Sprintf("PO-%d", time.Now().Unix())).
		SetStatus(purchaseorder.StatusSubmitted).
		Save(s.ctx)
	if err != nil {
		return 0, err
	}
	
	var total float64
	for _, item := range items {
		cost := decimal.NewFromFloat(item.UnitCost)
		_, _ = s.db.PurchaseOrderLine.Create().
			SetPurchaseOrder(po).
			SetProductID(item.ProductID).
			SetQuantity(item.Quantity).
			SetUnitCost(cost).
			Save(s.ctx)
		total += item.UnitCost * float64(item.Quantity)
	}
	
	_ = s.db.PurchaseOrder.UpdateOne(po).SetTotalAmount(decimal.NewFromFloat(total)).Exec(s.ctx)
	
	s.logAudit("create_purchase_order", "purchase_order", po.ID, map[string]interface{}{"supplier": supp.Name, "total": total})
	return po.ID, nil
}

// GetPurchaseOrders retrieves all POs for the tenant.
func (s *StockBridge) GetPurchaseOrders() ([]PurchaseOrderDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	
	pos, err := s.db.PurchaseOrder.Query().
		Where(purchaseorder.HasTenantWith(tenant.ID(profile.TenantID))).
		WithSupplier().
		WithLines(func(q *ent.PurchaseOrderLineQuery) {
			q.WithProduct()
		}).
		All(s.ctx)
	if err != nil {
		return nil, err
	}
	
	dtos := make([]PurchaseOrderDTO, len(pos))
	for i, po := range pos {
		amt, _ := po.TotalAmount.Float64()
		dtos[i] = PurchaseOrderDTO{
			ID: po.ID,
			PONumber: po.PoNumber,
			SupplierName: po.Edges.Supplier.Name,
			Status: string(po.Status),
			OrderDate: po.OrderDate,
			TotalAmount: amt,
		}
		for _, l := range po.Edges.Lines {
			cost, _ := l.UnitCost.Float64()
			dtos[i].Lines = append(dtos[i].Lines, PurchaseOrderLineDTO{
				ID: l.ID,
				ProductID: l.Edges.Product.ID,
				ProductName: l.Edges.Product.Name,
				Quantity: l.Quantity,
				UnitCost: cost,
				ReceivedQty: l.ReceivedQty,
			})
		}
	}
	return dtos, nil
}

// ReceivePurchaseOrder fulfills stock from a PO.
func (s *StockBridge) ReceivePurchaseOrder(poID int) error {
	po, err := s.db.PurchaseOrder.Query().
		Where(purchaseorder.ID(poID)).
		WithSupplier().
		WithLines(func(q *ent.PurchaseOrderLineQuery) {
			q.WithProduct()
		}).
		Only(s.ctx)
	if err != nil {
		return err
	}
	
	if po.Status == purchaseorder.StatusReceived {
		return fmt.Errorf("PO already received")
	}
	
	profile, _ := s.auth.GetUserProfile()

	for _, l := range po.Edges.Lines {
		// Update product quantity
		newQty := l.Edges.Product.Quantity.Add(decimal.NewFromInt(int64(l.Quantity)))
		err = s.db.Product.UpdateOne(l.Edges.Product).
			SetQuantity(newQty).
			Exec(s.ctx)
		if err != nil {
			return err
		}
			
		// Log movement
		_, _ = s.db.StockMovement.Create().
			SetTenantID(profile.TenantID).
			SetProduct(l.Edges.Product).
			SetQuantity(decimal.NewFromInt(int64(l.Quantity))).
			SetMovementType(stockmovement.MovementTypeIncoming).
			SetReason(fmt.Sprintf("PO Receipt: %s", po.PoNumber)).
			Save(s.ctx)
	}
	
	_ = s.db.PurchaseOrder.UpdateOne(po).SetStatus(purchaseorder.StatusReceived).Exec(s.ctx)
	return nil
}

// RecordCount logs a physical stock count.
func (s *StockBridge) RecordCount(productID int, counted float64) error {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return err
	}
	
	p, err := s.db.Product.Get(s.ctx, productID)
	if err != nil {
		return err
	}
	
	countedDec := decimal.NewFromFloat(counted)
	variance := countedDec.Sub(p.Quantity)
	
	_, err = s.db.InventoryCount.Create().
		SetTenantID(profile.TenantID).
		SetProduct(p).
		SetCountedQty(countedDec).
		SetSystemQty(p.Quantity).
		SetVariance(variance).
		SetCountedBy(profile.Name).
		Save(s.ctx)
		
	s.logAudit("inventory_count", "product", productID, map[string]interface{}{"counted": counted, "system": p.Quantity.String(), "variance": variance.String()})
	return err
}

// DisposeAsset retires a product from stock.
func (s *StockBridge) DisposeAsset(productID int, reason string) error {
	err := s.db.Product.UpdateOneID(productID).
		SetIsDisposed(true).
		SetDisposalDate(time.Now()).
		SetDisposalReason(reason).
		SetQuantity(decimal.Zero).
		Exec(s.ctx)
	
	s.logAudit("dispose_asset", "product", productID, map[string]interface{}{"reason": reason})
	return err
}

// ImportProducts handles bulk creation from CSV content.
func (s *StockBridge) ImportProducts(csvContent string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	
	importLines := strings.Split(csvContent, "\n")
	if len(importLines) < 2 {
		return "", fmt.Errorf("CSV too short")
	}
	
	// Skip header
	count := 0
	for i := 1; i < len(importLines); i++ {
		line := strings.TrimSpace(importLines[i])
		if line == "" { continue }
		
		parts := strings.Split(line, ",")
		if len(parts) < 3 { continue }
		
		sku := parts[0]
		name := parts[1]
		cost, _ := decimal.NewFromString(parts[2])
		
		_, err = s.db.Product.Create().
			SetTenantID(profile.TenantID).
			SetSku(sku).
			SetName(name).
			SetUnitCost(cost).
			Save(s.ctx)
		if err == nil {
			count++
		}
	}
	
	s.logAudit("bulk_import", "tenant", profile.TenantID, map[string]interface{}{"count": count})
	return fmt.Sprintf("Imported %d products.", count), nil
}

// UpdateLocation Updates the location string for a product.
func (s *StockBridge) UpdateLocation(productID int, newLocation string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	
	_, err = s.db.Product.Update().
		Where(product.ID(productID), product.HasTenantWith(tenant.ID(profile.TenantID))).
		SetLocation(newLocation).
		Save(s.ctx)
	
	if err != nil {
		return "", fmt.Errorf("failed to update location: %w", err)
	}
	
	return "Location updated", nil
}
