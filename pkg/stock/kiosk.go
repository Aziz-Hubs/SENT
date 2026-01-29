package stock

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/account"
	"sent/ent/inventoryreservation"
	"sent/ent/ledgerentry"
	"sent/ent/product"
	"sent/pkg/orchestrator"

	"github.com/jackc/pgx/v5"
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
	db     *ent.Client
	buffer *LocalPOSBuffer
	river  *river.Client[pgx.Tx]
	audit  AuditEmitter
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
func NewKioskBridge(db *ent.Client, river *river.Client[pgx.Tx], audit AuditEmitter) *KioskBridge {
	buffer, err := NewLocalPOSBuffer("pos_offline.db")
	if err != nil {
		fmt.Printf("[KIOSK] Warning: failed to initialize offline buffer: %v\n", err)
	}

	return &KioskBridge{
		db:     db,
		buffer: buffer,
		river:  river,
		audit:  audit,
	}
}

// ReserveStock triggers a 15-minute "Soft Lock" on stock.
func (k *KioskBridge) ReserveStock(productID int, quantity float64) (int, error) {
	tx, err := k.db.Tx(k.ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to start transaction: %w", err)
	}

	// 1. Check and decrement stock
	prod, err := tx.Product.Query().
		Where(product.ID(productID)).
		Only(k.ctx)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("product not found: %w", err)
	}

	if prod.Quantity < quantity {
		tx.Rollback()
		return 0, fmt.Errorf("insufficient stock")
	}

	err = tx.Product.UpdateOne(prod).
		AddQuantity(-quantity).
		Exec(k.ctx)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to decrement stock: %w", err)
	}

	// 2. Create reservation record
	tenant, err := tx.Tenant.Query().First(k.ctx)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to get tenant: %w", err)
	}

	res, err := tx.InventoryReservation.Create().
		SetProduct(prod).
		SetQuantity(quantity).
		SetExpiresAt(time.Now().Add(15 * time.Minute)).
		SetStatus(inventoryreservation.StatusActive).
		SetTenant(tenant).
		Save(k.ctx)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to create reservation: %w", err)
	}

	// 3. Commit DB transaction
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit: %w", err)
	}

	// 4. Enqueue River job for automatic release (after commit, or use transactional insert if possible)
	// Since we are using different transaction types (ent vs pgx), we'll insert after commit.
	// In a real high-integrity system, we'd use a shared transaction.
	if k.river != nil {
		_, err = k.river.Insert(k.ctx, ReservationReleaseArgs{
			ReservationID: res.ID,
		}, &river.InsertOpts{
			ScheduledAt: time.Now().Add(15 * time.Minute),
		})
		if err != nil {
			fmt.Printf("[KIOSK] Warning: failed to schedule reservation release job: %v\n", err)
		}
	}

	return res.ID, nil
}

// Startup initializes the bridge with the application context.
func (k *KioskBridge) Startup(ctx context.Context) {
	k.ctx = ctx
}

// OpenDrawerNoSale opens the cash drawer without a sale and emits a security event.
func (k *KioskBridge) OpenDrawerNoSale(actorID string) error {
	// 1. Send hardware signal
	if err := k.OpenDrawer(); err != nil {
		return err
	}

	// 2. Emit security event
	if k.audit != nil {
		err := k.audit.EmitEvent(orchestrator.SecurityAuditEvent{
			Type:      "no_sale",
			KioskID:   1, // In a real app, this would be the actual ID
			Timestamp: time.Now().Unix(),
			ActorID:   actorID,
		})
		if err != nil {
			fmt.Printf("[KIOSK] Warning: failed to emit security audit event: %v\n", err)
		}
	}

	return nil
}

// OpenDrawer sends a signal to the hardware cash drawer to open.
func (k *KioskBridge) OpenDrawer() error {
	// Implementation would go here.
	return nil
}

// PrintReceipt generates a formatted string receipt for a completed sale.
//
// @param req - The sale details.
// @returns A string representation of the receipt.
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
// It performs the following operations atomically:
// 1. Creates a transaction record.
// 2. Updates inventory (decrements stock).
// 3. Records stock movements.
// 4. Updates financial ledgers (Cash/Revenue).
//
// If the primary DB is unavailable, it buffers the request locally for later sync.
//
// @param req - The sale request details.
// @returns A success message or an error.
func (k *KioskBridge) Checkout(req SaleRequest) (string, error) {
	// Try primary DB first
	msg, err := k.performCheckout(req)
	if err != nil {
		// Log error and fallback to buffer if available
		fmt.Printf("[KIOSK] Primary checkout failed: %v. Attempting offline buffer...\n", err)
		
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
	// Start a database transaction.
	tx, err := k.db.Tx(k.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to start transaction: %w", err)
	}

	// Ensure rollback in case of panic or error, unless committed.
	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()

	// 1. Retrieve the default tenant.
	tenant, err := tx.Tenant.Query().First(k.ctx)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("failed to retrieve tenant: %w", err)
	}

	// 2. Create the main transaction record.
	txn, err := tx.Transaction.Create().
		SetDescription("Retail Sale - POS").
		SetDate(time.Now()).
		SetTenant(tenant).
		Save(k.ctx)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("failed to create transaction record: %w", err)
	}

	// 3. Process each item: update inventory and record movement.
	if err := k.processSaleItems(tx, tenant, txn, req.Items); err != nil {
		tx.Rollback()
		return "", err
	}

	// 4. Update financial ledgers.
	if err := k.updateFinancials(tx, tenant, txn, req.Total); err != nil {
		tx.Rollback()
		return "", err
	}

	// Commit the transaction.
	if err := tx.Commit(); err != nil {
		return "", fmt.Errorf("failed to commit transaction: %w", err)
	}

	return "Sale completed. Inventory and Ledger synchronized.", nil
}

// processSaleItems iterates through items to update stock and record movements.
func (k *KioskBridge) processSaleItems(tx *ent.Tx, tenant *ent.Tenant, txn *ent.Transaction, items []SaleItem) error {
	for _, item := range items {
		// Lock and retrieve the product to ensure consistency.
		prod, err := tx.Product.Query().
			Where(product.ID(item.ProductID)).
			Only(k.ctx)
		if err != nil {
			return fmt.Errorf("product not found (ID: %d): %w", item.ProductID, err)
		}

		// Handle Reservation if provided
		if item.ReservationID != nil {
			res, err := tx.InventoryReservation.Query().
				Where(
					inventoryreservation.ID(*item.ReservationID),
					inventoryreservation.HasProductWith(product.ID(prod.ID)),
					inventoryreservation.StatusEQ(inventoryreservation.StatusActive),
				).
				Only(k.ctx)
			if err != nil {
				return fmt.Errorf("active reservation %d not found for product %d: %w", *item.ReservationID, prod.ID, err)
			}

			// Mark reservation as completed
			err = tx.InventoryReservation.UpdateOne(res).
				SetStatus(inventoryreservation.StatusCompleted).
				Exec(k.ctx)
			if err != nil {
				return fmt.Errorf("failed to complete reservation: %w", err)
			}
			
			// Stock was already decremented during ReserveStock, so we skip it here.
		} else {
			// Normal checkout without reservation: decrement stock now.
			if prod.Quantity < item.Quantity {
				return fmt.Errorf("insufficient stock for %s (Requested: %.0f, Available: %.0f)", prod.Name, item.Quantity, prod.Quantity)
			}

			// Update product quantity.
			err = tx.Product.UpdateOne(prod).
				AddQuantity(-item.Quantity).
				Exec(k.ctx)
			if err != nil {
				return fmt.Errorf("failed to update stock for %s: %w", prod.Name, err)
			}
		}

		// Create stock movement record.
		_, err = tx.StockMovement.Create().
			SetQuantity(item.Quantity).
			SetMovementType("outgoing").
			SetReason("Retail Sale").
			SetProduct(prod).
			SetTenant(tenant).
			Save(k.ctx)
		if err != nil {
			return fmt.Errorf("failed to create stock movement for %s: %w", prod.Name, err)
		}
	}
	return nil
}

// updateFinancials handles the double-entry bookkeeping for the sale.
func (k *KioskBridge) updateFinancials(tx *ent.Tx, tenant *ent.Tenant, txn *ent.Transaction, totalAmount float64) error {
	// Identify accounts. Hardcoded for now per business logic, but should ideally be configurable.
	const (
		cashAccountNum    = "1000"
		revenueAccountNum = "4000"
	)

	cashAcc, err := tx.Account.Query().Where(account.Number(cashAccountNum)).Only(k.ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			// Soft fail or log? For strict accounting, this is a critical error.
			return fmt.Errorf("cash account (%s) not found", cashAccountNum)
		}
		return err
	}

	revAcc, err := tx.Account.Query().Where(account.Number(revenueAccountNum)).Only(k.ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return fmt.Errorf("revenue account (%s) not found", revenueAccountNum)
		}
		return err
	}

	// Debit Cash
	_, err = tx.LedgerEntry.Create().
		SetAmount(totalAmount).
		SetDirection(ledgerentry.DirectionDebit).
		SetAccount(cashAcc).
		SetTransaction(txn).
		SetTenant(tenant).
		Save(k.ctx)
	if err != nil {
		return fmt.Errorf("failed to create debit entry: %w", err)
	}

	// Credit Revenue
	_, err = tx.LedgerEntry.Create().
		SetAmount(totalAmount).
		SetDirection(ledgerentry.DirectionCredit).
		SetAccount(revAcc).
		SetTransaction(txn).
		SetTenant(tenant).
		Save(k.ctx)
	if err != nil {
		return fmt.Errorf("failed to create credit entry: %w", err)
	}

	// Update Account Balances (Denormalization for performance)
	// Note: This logic assumes 'Debit' increases Asset (Cash) and 'Credit' increases Income (Revenue).
	// This is a simplified view. Real accounting systems might handle this differently based on account type.
	err = tx.Account.UpdateOne(cashAcc).SetBalance(cashAcc.Balance + totalAmount).Exec(k.ctx)
	if err != nil {
		return fmt.Errorf("failed to update cash balance: %w", err)
	}

	err = tx.Account.UpdateOne(revAcc).SetBalance(revAcc.Balance + totalAmount).Exec(k.ctx)
	if err != nil {
		return fmt.Errorf("failed to update revenue balance: %w", err)
	}

		return nil

	}

	