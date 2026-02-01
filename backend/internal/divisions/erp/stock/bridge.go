package stock

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"sent/internal/platform/auth"

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
	db   *pgxpool.Pool
	auth *auth.AuthBridge
}

func NewStockBridge(db *pgxpool.Pool, auth *auth.AuthBridge) *StockBridge {
	return &StockBridge{
		db:   db,
		auth: auth,
	}
}

// Startup initializes the bridge context.
func (s *StockBridge) Startup(ctx context.Context) {
	s.ctx = ctx
}

// ProductDTO represents a product in the catalog.
type ProductDTO struct {
	ID                int       `json:"id"`
	SKU               string    `json:"sku"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	UnitCost          float64   `json:"unitCost"`
	Quantity          float64   `json:"quantity"`
	Reserved          float64   `json:"reserved"`
	Incoming          float64   `json:"incoming"`
	SupplierName      string    `json:"supplierName"`
	CategoryName      string    `json:"categoryName"`
	Barcode           string    `json:"barcode"`
	MinStock          int       `json:"minStock"`
	SerialNumber      string    `json:"serialNumber"`
	PurchaseDate      time.Time `json:"purchaseDate"`
	PurchasePrice     float64   `json:"purchasePrice"`
	UsefulLifeMonths  int       `json:"usefulLifeMonths"`
	WarrantyExpiresAt time.Time `json:"warrantyExpiresAt"`
	IsDisposed        bool      `json:"isDisposed"`
	CurrentValue      float64   `json:"currentValue"`
	Location          string    `json:"location"`
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
	ID           int                    `json:"id"`
	PONumber     string                 `json:"poNumber"`
	SupplierID   int                    `json:"supplierID"`
	SupplierName string                 `json:"supplierName"`
	Status       string                 `json:"status"`
	OrderDate    time.Time              `json:"orderDate"`
	ExpectedDate time.Time              `json:"expectedDate"`
	TotalAmount  float64                `json:"totalAmount"`
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
	ID          int       `json:"id"`
	ProductID   int       `json:"productID"`
	ProductName string    `json:"productName"`
	CountedQty  float64   `json:"countedQty"`
	SystemQty   float64   `json:"systemQty"`
	Variance    float64   `json:"variance"`
	CountedAt   time.Time `json:"countedAt"`
	CountedBy   string    `json:"countedBy"`
}

// GetProducts retrieves the full product catalog.
func (s *StockBridge) GetProducts() ([]ProductDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	query := `
		SELECT 
			p.id, p.sku, p.name, p.description, p.unit_cost, p.quantity, p.min_stock_level, 
			p.barcode, p.serial_number, p.purchase_date, p.useful_life_months, 
			p.is_disposed, p.location, p.purchase_price, p.warranty_expires_at,
			s.name as supplier_name, c.name as category_name
		FROM products p
		LEFT JOIN suppliers s ON p.supplier_id = s.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.tenant_id = $1`

	rows, err := s.db.Query(s.ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var products []ProductDTO
	for rows.Next() {
		var p ProductDTO
		var unitCost, purchasePrice decimal.NullDecimal
		var warrantyExpiresAt sql.NullTime
		var purchaseDate sql.NullTime

		err := rows.Scan(
			&p.ID, &p.SKU, &p.Name, &p.Description, &unitCost, &p.Quantity, &p.MinStock,
			&p.Barcode, &p.SerialNumber, &purchaseDate, &p.UsefulLifeMonths,
			&p.IsDisposed, &p.Location, &purchasePrice, &warrantyExpiresAt,
			&p.SupplierName, &p.CategoryName,
		)
		if err != nil {
			return nil, err
		}

		if unitCost.Valid {
			p.UnitCost, _ = unitCost.Decimal.Float64()
		}
		if purchasePrice.Valid {
			p.PurchasePrice, _ = purchasePrice.Decimal.Float64()
		}
		if purchaseDate.Valid {
			p.PurchaseDate = purchaseDate.Time
		}
		if warrantyExpiresAt.Valid {
			p.WarrantyExpiresAt = warrantyExpiresAt.Time
		}

		products = append(products, p)
	}

	if len(products) == 0 {
		if err := s.seedDefaultProducts(tenantID); err != nil {
			return nil, err
		}
		return s.GetProducts()
	}

	for i := range products {
		p := &products[i]
		qty := p.Quantity

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

		p.Reserved = reserved
		p.Incoming = incoming

		if p.PurchasePrice > 0 {
			// Calculate Depreciation (Simplified Straight-Line)
			if !p.PurchaseDate.IsZero() && p.UsefulLifeMonths > 0 {
				elapsed := time.Since(p.PurchaseDate).Hours() / 24 / 30
				if elapsed < 0 {
					elapsed = 0
				}
				factor := elapsed / float64(p.UsefulLifeMonths)
				if factor > 1 {
					factor = 1
				}
				p.CurrentValue = p.PurchasePrice * (1 - factor)
			} else {
				p.CurrentValue = p.PurchasePrice
			}
		}
	}
	return products, nil
}

// LogAudit internal helper for audit trail.
func (s *StockBridge) logAudit(action, entityType string, entityID int, details map[string]interface{}) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return
	}

	_, _ = s.db.Exec(s.ctx, `
		INSERT INTO stock_audit_logs (tenant_id, action, entity_type, entity_id, user_name, details) 
		VALUES ($1, $2, $3, $4, $5, $6)`,
		profile.TenantID, action, entityType, entityID, profile.Name, details)
}

// GetAuditLogs retrieves history for a product or general stock.
func (s *StockBridge) GetAuditLogs(entityType string, entityID int) ([]AuditLogDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	query := "SELECT id, action, entity_type, entity_id, user_name, created_at, details FROM stock_audit_logs WHERE tenant_id = $1"
	args := []interface{}{profile.TenantID}
	placeholder := 2

	if entityType != "" {
		query += fmt.Sprintf(" AND entity_type = $%d", placeholder)
		args = append(args, entityType)
		placeholder++
	}
	if entityID > 0 {
		query += fmt.Sprintf(" AND entity_id = $%d", placeholder)
		args = append(args, entityID)
		placeholder++
	}

	query += " ORDER BY created_at DESC LIMIT 100"

	rows, err := s.db.Query(s.ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dtos []AuditLogDTO
	for rows.Next() {
		var l AuditLogDTO
		var details map[string]interface{}
		if err := rows.Scan(&l.ID, &l.Action, &l.EntityType, &l.EntityID, &l.UserName, &l.CreatedAt, &details); err != nil {
			return nil, err
		}
		l.Details = fmt.Sprintf("%v", details)
		dtos = append(dtos, l)
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

	rows, err := s.db.Query(s.ctx, `
		SELECT id, sku, name, warranty_expires_at 
		FROM products 
		WHERE tenant_id = $1 AND warranty_expires_at < $2 AND warranty_expires_at > NOW()`,
		profile.TenantID, threshold)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dtos []ProductDTO
	for rows.Next() {
		var p ProductDTO
		if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.WarrantyExpiresAt); err != nil {
			return nil, err
		}
		dtos = append(dtos, p)
	}
	return dtos, nil
}

func (s *StockBridge) seedDefaultProducts(tenantID int) error {
	// Check if products already exist
	var exists bool
	err := s.db.QueryRow(s.ctx, "SELECT EXISTS(SELECT 1 FROM products WHERE tenant_id = $1)", tenantID).Scan(&exists)
	if err != nil && err != pgx.ErrNoRows {
		return err
	}
	if exists {
		return nil
	}

	_, err = s.db.Exec(s.ctx, `
		INSERT INTO products (sku, name, unit_cost, quantity, tenant_id) VALUES 
		('SRV-L1', 'Standard Server L1', 1200, 5, $1),
		('LAP-P1', 'Pro Laptop 14', 1800, 8, $1)`,
		tenantID)

	if err != nil {
		return fmt.Errorf("failed to seed products: %w", err)
	}
	return nil
}

// CalculateCOGS estimates the Cost of Goods Sold for a given quantity of product (FIFO).
func (s *StockBridge) CalculateCOGS(productID int, qty float64) (float64, error) {
	decimalQty := decimal.NewFromFloat(qty)

	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}
	tenantID := profile.TenantID

	// Query historical incoming movements for this specific product, ordered by date (FIFO)
	rows, err := s.db.Query(s.ctx, `
		SELECT quantity 
		FROM stock_movements 
		WHERE product_id = $1 AND tenant_id = $2 AND movement_type = 'incoming'
		ORDER BY created_at ASC`, productID, tenantID)
	if err != nil {
		return 0, fmt.Errorf("failed to query stock history: %w", err)
	}
	defer rows.Close()

	var unitCost decimal.Decimal
	err = s.db.QueryRow(s.ctx, "SELECT unit_cost FROM products WHERE id = $1", productID).Scan(&unitCost)
	if err != nil {
		return 0, fmt.Errorf("failed to get product unit cost: %w", err)
	}

	totalCost := decimal.Zero
	remaining := decimalQty

	for rows.Next() {
		if remaining.IsZero() {
			break
		}

		var mQty decimal.Decimal
		if err := rows.Scan(&mQty); err != nil {
			return 0, err
		}

		take := mQty
		if take.GreaterThan(remaining) {
			take = remaining
		}

		totalCost = totalCost.Add(take.Mul(unitCost))
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

	var productID int
	err = s.db.QueryRow(s.ctx, `
		INSERT INTO products (sku, name, description, unit_cost, quantity, tenant_id) 
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		p.SKU, p.Name, p.Description, p.UnitCost, p.Quantity, tenantID).Scan(&productID)
	if err != nil {
		return 0, fmt.Errorf("failed to create product: %w", err)
	}
	return productID, nil
}

// AdjustStock creates a stock movement and updates the product quantity.
func (s *StockBridge) AdjustStock(adj StockAdjustment) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := profile.TenantID

	tx, err := s.db.Begin(s.ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(s.ctx)

	var currentQty float64
	var productName string
	err = tx.QueryRow(s.ctx, "SELECT quantity, name FROM products WHERE id = $1 AND tenant_id = $2", adj.ProductID, tenantID).Scan(&currentQty, &productName)
	if err != nil {
		return "", fmt.Errorf("product not found or access denied: %w", err)
	}

	// Create Movement Record
	_, err = tx.Exec(s.ctx, `
		INSERT INTO stock_movements (quantity, movement_type, reason, product_id, tenant_id, metadata) 
		VALUES ($1, $2, $3, $4, $5, $6)`,
		adj.Quantity, adj.Type, adj.Reason, adj.ProductID, tenantID, adj.Metadata)
	if err != nil {
		return "", fmt.Errorf("failed to log movement: %w", err)
	}

	// Update Actual Quantity
	newQtyDec := decimal.NewFromFloat(currentQty)
	decimalAdj := decimal.NewFromFloat(adj.Quantity)
	switch adj.Type {
	case MovementTypeIncoming:
		newQtyDec = newQtyDec.Add(decimalAdj)
	case MovementTypeOutgoing:
		newQtyDec = newQtyDec.Sub(decimalAdj)
	case MovementTypeManual:
		newQtyDec = decimalAdj
	default:
		return "", fmt.Errorf("unknown adjustment type: %s", adj.Type)
	}

	newQtyFinal, _ := newQtyDec.Float64()
	_, err = tx.Exec(s.ctx, "UPDATE products SET quantity = $1 WHERE id = $2", newQtyFinal, adj.ProductID)
	if err != nil {
		return "", fmt.Errorf("failed to update product quantity: %w", err)
	}

	if err := tx.Commit(s.ctx); err != nil {
		return "", err
	}

	return fmt.Sprintf("Stock updated for %s. New Qty: %.2f", productName, newQtyFinal), nil
}

// GetHistory retrieves the full stock movement history.
func (s *StockBridge) GetHistory() ([]StockMovementDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	rows, err := s.db.Query(s.ctx, `
		SELECT m.id, m.movement_type, m.quantity, m.reason, m.created_at, p.name 
		FROM stock_movements m 
		LEFT JOIN products p ON m.product_id = p.id 
		WHERE m.tenant_id = $1`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query history: %w", err)
	}
	defer rows.Close()

	var dtos []StockMovementDTO
	for rows.Next() {
		var m StockMovementDTO
		var qty decimal.Decimal
		if err := rows.Scan(&m.ID, &m.Type, &qty, &m.Reason, &m.Date, &m.ProductName); err != nil {
			return nil, err
		}
		m.Quantity, _ = qty.Float64()
		dtos = append(dtos, m)
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

	rows, err := s.db.Query(s.ctx, "SELECT id, name FROM suppliers WHERE tenant_id = $1", profile.TenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list suppliers: %w", err)
	}
	defer rows.Close()

	var dtos []SupplierDTO
	for rows.Next() {
		var v SupplierDTO
		if err := rows.Scan(&v.ID, &v.Name); err != nil {
			return nil, err
		}
		dtos = append(dtos, v)
	}
	return dtos, nil
}

// GetCategories lists all categories.
func (s *StockBridge) GetCategories() ([]CategoryDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, "SELECT id, name, type FROM categories WHERE tenant_id = $1", profile.TenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}
	defer rows.Close()

	var dtos []CategoryDTO
	for rows.Next() {
		var v CategoryDTO
		var catType string
		if err := rows.Scan(&v.ID, &v.Name, &catType); err != nil {
			return nil, err
		}
		v.Type = catType
		dtos = append(dtos, v)
	}
	return dtos, nil
}

// AssignAsset assigns a product unit to an employee (Check-out).
func (s *StockBridge) AssignAsset(productID int, employeeID int, reason string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := profile.TenantID

	tx, err := s.db.Begin(s.ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(s.ctx)

	// 1. Get Product
	var qty float64
	var productName string
	err = tx.QueryRow(s.ctx, "SELECT quantity, name FROM products WHERE id = $1 AND tenant_id = $2", productID, tenantID).Scan(&qty, &productName)
	if err != nil {
		return "", fmt.Errorf("product not found: %w", err)
	}

	if qty < 1 {
		return "", fmt.Errorf("insufficient stock to assign asset")
	}

	// 2. Create Assignment
	_, err = tx.Exec(s.ctx, `
		INSERT INTO asset_assignments (tenant_id, product_id, employee_id, status, assigned_at) 
		VALUES ($1, $2, $3, 'active', NOW())`,
		tenantID, productID, employeeID)
	if err != nil {
		return "", fmt.Errorf("failed to create assignment: %w", err)
	}

	// 3. Decrement Stock (Log Movement)
	_, err = tx.Exec(s.ctx, `
		INSERT INTO stock_movements (tenant_id, product_id, movement_type, quantity, reason) 
		VALUES ($1, $2, 'outgoing', 1, $3)`,
		tenantID, productID, fmt.Sprintf("Assigned to Employee #%d: %s", employeeID, reason))
	if err != nil {
		return "", fmt.Errorf("failed to log movement: %w", err)
	}

	// Update product quantity
	_, err = tx.Exec(s.ctx, "UPDATE products SET quantity = quantity - 1 WHERE id = $1", productID)
	if err != nil {
		return "", fmt.Errorf("failed to update stock count: %w", err)
	}

	if err := tx.Commit(s.ctx); err != nil {
		return "", err
	}

	return "Asset assigned successfully", nil
}

// GetEmployees lists all employees for assignment.
func (s *StockBridge) GetEmployees() ([]EmployeeDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, "SELECT id, first_name, last_name FROM employees WHERE tenant_id = $1", profile.TenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list employees: %w", err)
	}
	defer rows.Close()

	var dtos []EmployeeDTO
	for rows.Next() {
		var e EmployeeDTO
		var first, last string
		if err := rows.Scan(&e.ID, &first, &last); err != nil {
			return nil, err
		}
		e.Name = first + " " + last
		dtos = append(dtos, e)
	}
	return dtos, nil
}

// GetProductAssignments lists active assignments for a product.
func (s *StockBridge) GetProductAssignments(productID int) ([]AssignmentDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, `
		SELECT a.id, a.assigned_at, a.status, e.first_name, e.last_name 
		FROM asset_assignments a 
		LEFT JOIN employees e ON a.employee_id = e.id 
		WHERE a.product_id = $1 AND a.tenant_id = $2 AND a.status = 'active'`,
		productID, profile.TenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list assignments: %w", err)
	}
	defer rows.Close()

	var dtos []AssignmentDTO
	for rows.Next() {
		var a AssignmentDTO
		var first, last string
		if err := rows.Scan(&a.ID, &a.AssignedAt, &a.Status, &first, &last); err != nil {
			return nil, err
		}
		a.EmployeeName = first + " " + last
		dtos = append(dtos, a)
	}
	return dtos, nil
}

// ReturnAsset processes an asset return from an employee.
func (s *StockBridge) ReturnAsset(assignmentID int, notes string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := profile.TenantID

	tx, err := s.db.Begin(s.ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(s.ctx)

	// 1. Get Assignment
	var status string
	var productID int
	var empID int
	err = tx.QueryRow(s.ctx, "SELECT status, product_id, employee_id FROM asset_assignments WHERE id = $1 AND tenant_id = $2", assignmentID, tenantID).Scan(&status, &productID, &empID)
	if err != nil {
		return "", fmt.Errorf("assignment not found: %w", err)
	}

	if status == "returned" {
		return "", fmt.Errorf("asset already returned")
	}

	// 2. Update Assignment Status
	_, err = tx.Exec(s.ctx, "UPDATE asset_assignments SET status = 'returned', returned_at = NOW() WHERE id = $1", assignmentID)
	if err != nil {
		return "", fmt.Errorf("failed to update assignment: %w", err)
	}

	// 3. Increment Stock (Incoming)
	_, err = tx.Exec(s.ctx, "UPDATE products SET quantity = quantity + 1 WHERE id = $1", productID)
	if err != nil {
		return "", fmt.Errorf("failed to restore stock: %w", err)
	}

	// 4. Log Movement
	var empName string
	_ = tx.QueryRow(s.ctx, "SELECT COALESCE(first_name || ' ' || last_name, 'Unknown') FROM employees WHERE id = $1", empID).Scan(&empName)

	_, err = tx.Exec(s.ctx, `
		INSERT INTO stock_movements (tenant_id, product_id, movement_type, quantity, reason) 
		VALUES ($1, $2, 'incoming', 1, $3)`,
		tenantID, productID, fmt.Sprintf("Returned by %s. Notes: %s", empName, notes))
	if err != nil {
		return "", fmt.Errorf("failed to log return movement: %w", err)
	}

	if err := tx.Commit(s.ctx); err != nil {
		return "", err
	}

	return "Asset returned successfully", nil
}

// CreateSupplier adds a new supplier.
func (s *StockBridge) CreateSupplier(name string) (string, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	_, err = s.db.Exec(s.ctx, "INSERT INTO suppliers (tenant_id, name) VALUES ($1, $2)", profile.TenantID, name)
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

	_, err = s.db.Exec(s.ctx, "INSERT INTO categories (tenant_id, name, type) VALUES ($1, $2, $3)", profile.TenantID, name, catType)
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

	_, err = s.db.Exec(s.ctx, `
		INSERT INTO maintenance_schedules (tenant_id, product_id, scheduled_at, notes, status) 
		VALUES ($1, $2, $3, $4, 'pending')`,
		profile.TenantID, productID, date, notes)

	if err == nil {
		s.logAudit("schedule_maintenance", "product", productID, map[string]interface{}{"date": date, "notes": notes})
	}
	return err
}

// GetPendingMaintenance returns all upcoming maintenance tasks.
func (s *StockBridge) GetPendingMaintenance() ([]MaintenanceScheduleDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, `
		SELECT m.id, m.product_id, p.name, m.scheduled_at, m.status, m.notes 
		FROM maintenance_schedules m 
		LEFT JOIN products p ON m.product_id = p.id 
		WHERE m.tenant_id = $1 AND m.status = 'pending'`,
		profile.TenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dtos []MaintenanceScheduleDTO
	for rows.Next() {
		var t MaintenanceScheduleDTO
		if err := rows.Scan(&t.ID, &t.ProductID, &t.ProductName, &t.ScheduledAt, &t.Status, &t.Notes); err != nil {
			return nil, err
		}
		dtos = append(dtos, t)
	}
	return dtos, nil
}

// CompleteMaintenance marks a task as finished.
func (s *StockBridge) CompleteMaintenance(id int) error {
	_, err := s.db.Exec(s.ctx, "UPDATE maintenance_schedules SET status = 'completed', completed_at = NOW() WHERE id = $1", id)
	if err == nil {
		s.logAudit("complete_maintenance", "maintenance_schedule", id, nil)
	}
	return err
}

// GetAlerts returns active stock alerts.
func (s *StockBridge) GetAlerts() ([]StockAlertDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, `
		SELECT a.id, a.alert_type, a.message, a.created_at, a.product_id 
		FROM stock_alerts a 
		WHERE a.tenant_id = $1 AND a.is_read = false`,
		profile.TenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dtos []StockAlertDTO
	for rows.Next() {
		var a StockAlertDTO
		var pID sql.NullInt32
		if err := rows.Scan(&a.ID, &a.Type, &a.Message, &a.CreatedAt, &pID); err != nil {
			return nil, err
		}
		if pID.Valid {
			a.ProductID = int(pID.Int32)
		}
		dtos = append(dtos, a)
	}
	return dtos, nil
}

// MarkAlertRead dismisses an alert.
func (s *StockBridge) MarkAlertRead(id int) error {
	_, err := s.db.Exec(s.ctx, "UPDATE stock_alerts SET is_read = true WHERE id = $1", id)
	return err
}

// CreatePurchaseOrder generates a new PO for a supplier.
func (s *StockBridge) CreatePurchaseOrder(supplierID int, items []PurchaseOrderLineDTO) (int, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}
	tenantID := profile.TenantID

	tx, err := s.db.Begin(s.ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(s.ctx)

	var poID int
	poNum := fmt.Sprintf("PO-%d", time.Now().Unix())
	err = tx.QueryRow(s.ctx, `
		INSERT INTO purchase_orders (tenant_id, supplier_id, po_number, status, order_date) 
		VALUES ($1, $2, $3, 'submitted', NOW()) RETURNING id`,
		tenantID, supplierID, poNum).Scan(&poID)
	if err != nil {
		return 0, err
	}

	total := decimal.Zero
	for _, item := range items {
		cost := decimal.NewFromFloat(item.UnitCost)
		_, err = tx.Exec(s.ctx, `
			INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_cost) 
			VALUES ($1, $2, $3, $4)`,
			poID, item.ProductID, item.Quantity, cost)
		if err != nil {
			return 0, err
		}
		total = total.Add(cost.Mul(decimal.NewFromInt(int64(item.Quantity))))
	}

	_, err = tx.Exec(s.ctx, "UPDATE purchase_orders SET total_amount = $1 WHERE id = $2", total, poID)
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(s.ctx); err != nil {
		return 0, err
	}

	s.logAudit("create_purchase_order", "purchase_order", poID, map[string]interface{}{"po_number": poNum, "total": total})
	return poID, nil
}

// GetPurchaseOrders retrieves all POs for the tenant.
func (s *StockBridge) GetPurchaseOrders() ([]PurchaseOrderDTO, error) {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	rows, err := s.db.Query(s.ctx, `
		SELECT po.id, po.po_number, po.status, po.order_date, po.total_amount, s.name 
		FROM purchase_orders po 
		LEFT JOIN suppliers s ON po.supplier_id = s.id 
		WHERE po.tenant_id = $1`, profile.TenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dtos []PurchaseOrderDTO
	placeholderItems := make(map[int]*PurchaseOrderDTO)
	var poIDs []int

	for rows.Next() {
		var po PurchaseOrderDTO
		var amt decimal.NullDecimal
		if err := rows.Scan(&po.ID, &po.PONumber, &po.Status, &po.OrderDate, &amt, &po.SupplierName); err != nil {
			return nil, err
		}
		if amt.Valid {
			po.TotalAmount, _ = amt.Decimal.Float64()
		}
		dtos = append(dtos, po)
		poIDs = append(poIDs, po.ID)
		placeholderItems[po.ID] = &dtos[len(dtos)-1]
	}

	if len(poIDs) > 0 {
		lineRows, err := s.db.Query(s.ctx, `
			SELECT l.id, l.purchase_order_id, l.product_id, p.name, l.quantity, l.unit_cost, l.received_qty 
			FROM purchase_order_lines l 
			LEFT JOIN products p ON l.product_id = p.id 
			WHERE l.purchase_order_id = ANY($1)`, poIDs)
		if err != nil {
			return dtos, nil // Partial success
		}
		defer lineRows.Close()

		for lineRows.Next() {
			var l PurchaseOrderLineDTO
			var poID int
			var cost decimal.Decimal
			if err := lineRows.Scan(&l.ID, &poID, &l.ProductID, &l.ProductName, &l.Quantity, &cost, &l.ReceivedQty); err != nil {
				continue
			}
			l.UnitCost, _ = cost.Float64()
			if po, ok := placeholderItems[poID]; ok {
				po.Lines = append(po.Lines, l)
			}
		}
	}

	return dtos, nil
}

// ReceivePurchaseOrder fulfills stock from a PO.
func (s *StockBridge) ReceivePurchaseOrder(poID int) error {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return err
	}
	tenantID := profile.TenantID

	tx, err := s.db.Begin(s.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(s.ctx)

	var status string
	var poNum string
	err = tx.QueryRow(s.ctx, "SELECT status, po_number FROM purchase_orders WHERE id = $1 AND tenant_id = $2", poID, tenantID).Scan(&status, &poNum)
	if err != nil {
		return err
	}

	if status == "received" {
		return fmt.Errorf("PO already received")
	}

	rows, err := tx.Query(s.ctx, "SELECT product_id, quantity FROM purchase_order_lines WHERE purchase_order_id = $1", poID)
	if err != nil {
		return err
	}
	defer rows.Close()

	type poItem struct {
		pID int
		qty int
	}
	var items []poItem
	for rows.Next() {
		var it poItem
		if err := rows.Scan(&it.pID, &it.qty); err != nil {
			return err
		}
		items = append(items, it)
	}

	for _, it := range items {
		_, err = tx.Exec(s.ctx, "UPDATE products SET quantity = quantity + $1 WHERE id = $2", it.qty, it.pID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(s.ctx, `
			INSERT INTO stock_movements (tenant_id, product_id, quantity, movement_type, reason) 
			VALUES ($1, $2, $3, 'incoming', $4)`,
			tenantID, it.pID, it.qty, fmt.Sprintf("PO Receipt: %s", poNum))
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(s.ctx, "UPDATE purchase_orders SET status = 'received' WHERE id = $1", poID)
	if err != nil {
		return err
	}

	return tx.Commit(s.ctx)
}

// RecordCount logs a physical stock count.
func (s *StockBridge) RecordCount(productID int, counted float64) error {
	profile, err := s.auth.GetUserProfile()
	if err != nil {
		return err
	}

	var systemQty float64
	err = s.db.QueryRow(s.ctx, "SELECT quantity FROM products WHERE id = $1", productID).Scan(&systemQty)
	if err != nil {
		return err
	}

	variance := counted - systemQty

	_, err = s.db.Exec(s.ctx, `
		INSERT INTO inventory_counts (tenant_id, product_id, counted_qty, system_qty, variance, counted_by) 
		VALUES ($1, $2, $3, $4, $5, $6)`,
		profile.TenantID, productID, counted, systemQty, variance, profile.Name)

	if err == nil {
		s.logAudit("inventory_count", "product", productID, map[string]interface{}{"counted": counted, "system": systemQty, "variance": variance})
	}
	return err
}

// DisposeAsset retires a product from stock.
func (s *StockBridge) DisposeAsset(productID int, reason string) error {
	_, err := s.db.Exec(s.ctx, `
		UPDATE products 
		SET is_disposed = true, disposal_date = NOW(), disposal_reason = $1, quantity = 0 
		WHERE id = $2`,
		reason, productID)

	if err == nil {
		s.logAudit("dispose_asset", "product", productID, map[string]interface{}{"reason": reason})
	}
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

	count := 0
	for i := 1; i < len(importLines); i++ {
		line := strings.TrimSpace(importLines[i])
		if line == "" {
			continue
		}

		parts := strings.Split(line, ",")
		if len(parts) < 3 {
			continue
		}

		sku := parts[0]
		name := parts[1]
		cost := parts[2]

		_, err = s.db.Exec(s.ctx, `
			INSERT INTO products (tenant_id, sku, name, unit_cost, quantity) 
			VALUES ($1, $2, $3, $4, 0)`,
			profile.TenantID, sku, name, cost)
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

	_, err = s.db.Exec(s.ctx, "UPDATE products SET location = $1 WHERE id = $2 AND tenant_id = $3", newLocation, productID, profile.TenantID)
	if err != nil {
		return "", fmt.Errorf("failed to update location: %w", err)
	}

	return "Location updated", nil
}
