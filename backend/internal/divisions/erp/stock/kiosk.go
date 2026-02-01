package stock

import (
	"context"
	"fmt"
	"time"

	"sent/internal/platform/auth"
	"sent/internal/platform/orchestrator"

	"github.com/shopspring/decimal"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

// AuditEmitter defines the interface for sending security events.
type AuditEmitter interface {
	EmitEvent(evt orchestrator.SecurityAuditEvent) error
}

// KioskBridge serves as the interface for Point-of-Sale (POS) operations.
// It handles sales transactions, receipt generation, and inventory management.
type KioskBridge struct {
	ctx    context.Context
	db     *pgxpool.Pool
	buffer *LocalPOSBuffer
	river  *river.Client[pgx.Tx]
	audit  AuditEmitter
	auth   *auth.AuthBridge
}

// SaleItem represents a single line item in a sales transaction.
type SaleItem struct {
	ProductID     int     `json:"productId"`
	Quantity      float64 `json:"quantity"`
	Price         float64 `json:"price"`
	ReservationID *int    `json:"reservationId,omitempty"`
}

// SaleRequest encapsulates the details of a sales transaction.
type SaleRequest struct {
	Items         []SaleItem `json:"items"`
	Total         float64    `json:"total"`
	PaymentMethod string     `json:"paymentMethod"`
}

// NewKioskBridge initializes a new KioskBridge with the given database client and river client.
func NewKioskBridge(db *pgxpool.Pool, river *river.Client[pgx.Tx], audit AuditEmitter, auth *auth.AuthBridge) *KioskBridge {
	buffer, err := NewLocalPOSBuffer("pos_offline.db")
	if err != nil {
		fmt.Printf("[KIOSK] Warning: failed to initialize offline buffer: %v\n", err)
	}

	return &KioskBridge{
		db:     db,
		buffer: buffer,
		river:  river,
		audit:  audit,
		auth:   auth,
	}
}

// ReserveStock triggers a 15-minute "Soft Lock" on stock.
func (k *KioskBridge) ReserveStock(productID int, quantity float64) (int, error) {
	tx, err := k.db.Begin(k.ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(k.ctx)

	// 1. Check and decrement stock
	var currentQty decimal.Decimal
	err = tx.QueryRow(k.ctx, "SELECT quantity FROM products WHERE id = $1", productID).Scan(&currentQty)
	if err != nil {
		return 0, fmt.Errorf("product not found: %w", err)
	}

	decimalQty := decimal.NewFromFloat(quantity)
	if currentQty.LessThan(decimalQty) {
		return 0, fmt.Errorf("insufficient stock")
	}

	_, err = tx.Exec(k.ctx, "UPDATE products SET quantity = quantity - $1 WHERE id = $2", decimalQty, productID)
	if err != nil {
		return 0, fmt.Errorf("failed to decrement stock: %w", err)
	}

	var tenantID int
	err = tx.QueryRow(k.ctx, "SELECT id FROM tenants LIMIT 1").Scan(&tenantID)
	if err != nil {
		return 0, fmt.Errorf("failed to get tenant: %w", err)
	}

	var resID int
	err = tx.QueryRow(k.ctx, `
		INSERT INTO inventory_reservations (product_id, quantity, expires_at, status, tenant_id) 
		VALUES ($1, $2, $3, 'active', $4) RETURNING id`,
		productID, decimalQty, time.Now().Add(15*time.Minute), tenantID).Scan(&resID)
	if err != nil {
		return 0, fmt.Errorf("failed to create reservation: %w", err)
	}

	if err := tx.Commit(k.ctx); err != nil {
		return 0, fmt.Errorf("failed to commit: %w", err)
	}

	if k.river != nil {
		_, err = k.river.Insert(k.ctx, ReservationReleaseArgs{
			ReservationID: resID,
		}, &river.InsertOpts{
			ScheduledAt: time.Now().Add(15 * time.Minute),
		})
	}

	return resID, nil
}

// Startup initializes the bridge with the application context.
func (k *KioskBridge) Startup(ctx context.Context) {
	k.ctx = ctx
}

// OpenDrawerNoSale opens the cash drawer without a sale and emits a security event.
func (k *KioskBridge) OpenDrawerNoSale(actorID string) error {
	if !k.auth.HasRole("admin") {
		return fmt.Errorf("permission denied: elevated privileges required for no-sale drawer opening")
	}
	if err := k.OpenDrawer(); err != nil {
		return err
	}

	if k.audit != nil {
		_ = k.audit.EmitEvent(orchestrator.SecurityAuditEvent{
			EventType: "no_sale",
			KioskID:   1,
			Timestamp: time.Now().Unix(),
			ActorID:   actorID,
		})
	}

	return nil
}

// OpenDrawer sends a signal to the hardware cash drawer to open.
func (k *KioskBridge) OpenDrawer() error {
	return nil
}

// PrintReceipt generates a formatted string receipt for a completed sale.
func (k *KioskBridge) PrintReceipt(req SaleRequest) (string, error) {
	receipt := "--- SENTkiosk RECEIPT ---\n"
	receipt += fmt.Sprintf("Date: %s\n", time.Now().Format(time.RFC822))
	receipt += "-------------------------\n"

	for _, item := range req.Items {
		receipt += fmt.Sprintf("Item %d  x%.0f  $%.2f\n", item.ProductID, item.Quantity, item.Price)
	}

	receipt += "-------------------------\n"
	receipt += fmt.Sprintf("TOTAL: $%.2f\n", req.Total)
	receipt += "--- THANK YOU ---\n"

	return receipt, nil
}

// Checkout processes a sales transaction.
func (k *KioskBridge) Checkout(req SaleRequest) (string, error) {
	msg, err := k.performCheckout(req)
	if err != nil {
		if k.buffer != nil {
			if bErr := k.buffer.BufferSale(req); bErr != nil {
				return "", fmt.Errorf("checkout failed and offline buffer failed: %w (buffer err: %v)", err, bErr)
			}
			return "Primary DB unavailable. Sale recorded in offline buffer.", nil
		}
		return "", err
	}
	return msg, nil
}

func (k *KioskBridge) performCheckout(req SaleRequest) (string, error) {
	tx, err := k.db.Begin(k.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(k.ctx)

	var tenantID int
	err = tx.QueryRow(k.ctx, "SELECT id FROM tenants LIMIT 1").Scan(&tenantID)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve tenant: %w", err)
	}

	var txnID int
	err = tx.QueryRow(k.ctx, "INSERT INTO transactions (description, date, tenant_id) VALUES ('Retail Sale - POS', $1, $2) RETURNING id", time.Now(), tenantID).Scan(&txnID)
	if err != nil {
		return "", fmt.Errorf("failed to create transaction record: %w", err)
	}

	if err := k.processSaleItems(tx, tenantID, txnID, req.Items); err != nil {
		return "", err
	}

	if err := k.updateFinancials(tx, tenantID, txnID, req.Total); err != nil {
		return "", err
	}

	if err := tx.Commit(k.ctx); err != nil {
		return "", fmt.Errorf("failed to commit transaction: %w", err)
	}

	return "Sale completed. Inventory and Ledger synchronized.", nil
}

func (k *KioskBridge) processSaleItems(tx pgx.Tx, tenantID int, txnID int, items []SaleItem) error {
	for _, item := range items {
		if item.ReservationID != nil {
			var resStatus string
			err := tx.QueryRow(k.ctx, "SELECT status FROM inventory_reservations WHERE id = $1 AND product_id = $2", *item.ReservationID, item.ProductID).Scan(&resStatus)
			if err != nil || resStatus != "active" {
				return fmt.Errorf("active reservation %d not found for product %d", *item.ReservationID, item.ProductID)
			}
			_, err = tx.Exec(k.ctx, "UPDATE inventory_reservations SET status = 'completed' WHERE id = $1", *item.ReservationID)
			if err != nil {
				return fmt.Errorf("failed to complete reservation: %w", err)
			}
		} else {
			decimalQty := decimal.NewFromFloat(item.Quantity)
			var currentQty decimal.Decimal
			err := tx.QueryRow(k.ctx, "SELECT quantity FROM products WHERE id = $1", item.ProductID).Scan(&currentQty)
			if err != nil || currentQty.LessThan(decimalQty) {
				return fmt.Errorf("insufficient stock for product %d", item.ProductID)
			}
			_, err = tx.Exec(k.ctx, "UPDATE products SET quantity = quantity - $1 WHERE id = $2", decimalQty, item.ProductID)
			if err != nil {
				return fmt.Errorf("failed to update stock: %w", err)
			}
		}

		_, err := tx.Exec(k.ctx, `
			INSERT INTO stock_movements (quantity, movement_type, reason, product_id, tenant_id) 
			VALUES ($1, 'outgoing', 'Retail Sale', $2, $3)`,
			decimal.NewFromFloat(item.Quantity), item.ProductID, tenantID)
		if err != nil {
			return fmt.Errorf("failed to create stock movement: %w", err)
		}
	}
	return nil
}

func (k *KioskBridge) updateFinancials(tx pgx.Tx, tenantID int, txnID int, totalAmount float64) error {
	const (
		cashAccountNum    = "1000"
		revenueAccountNum = "4000"
	)

	var cashAccID int
	err := tx.QueryRow(k.ctx, "SELECT id FROM accounts WHERE number = $1 AND tenant_id = $2", cashAccountNum, tenantID).Scan(&cashAccID)
	if err != nil {
		return fmt.Errorf("cash account (%s) not found", cashAccountNum)
	}

	var revAccID int
	err = tx.QueryRow(k.ctx, "SELECT id FROM accounts WHERE number = $1 AND tenant_id = $2", revenueAccountNum, tenantID).Scan(&revAccID)
	if err != nil {
		return fmt.Errorf("revenue account (%s) not found", revenueAccountNum)
	}

	decimalTotal := decimal.NewFromFloat(totalAmount)
	_, err = tx.Exec(k.ctx, "INSERT INTO ledger_entries (amount, direction, account_id, transaction_id, tenant_id) VALUES ($1, 'debit', $2, $3, $4)", decimalTotal, cashAccID, txnID, tenantID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(k.ctx, "INSERT INTO ledger_entries (amount, direction, account_id, transaction_id, tenant_id) VALUES ($1, 'credit', $2, $3, $4)", decimalTotal, revAccID, txnID, tenantID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(k.ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", decimalTotal, cashAccID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(k.ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", decimalTotal, revAccID)
	if err != nil {
		return err
	}

	return nil
}
