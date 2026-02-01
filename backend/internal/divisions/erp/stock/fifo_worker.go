package stock

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type FIFOWorker struct {
	db *pgxpool.Pool
}

func NewFIFOWorker(db *pgxpool.Pool) *FIFOWorker {
	return &FIFOWorker{db: db}
}

func (w *FIFOWorker) Run(ctx context.Context) error {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	fmt.Println("[STOCK] FIFO COGS worker started.")

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.ReconcileCOGS(ctx); err != nil {
				fmt.Printf("[STOCK] FIFO error: %v\n", err)
			}
		}
	}
}

func (w *FIFOWorker) ReconcileCOGS(ctx context.Context) error {
	rows, err := w.db.Query(ctx, "SELECT id, product_id, tenant_id, quantity, calculated_cogs FROM stock_movements WHERE movement_type = 'incoming' AND calculated_cogs = 0")
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var m struct {
			ID             int
			ProductID      int
			TenantID       int
			Quantity       decimal.Decimal
			CalculatedCogs decimal.Decimal
		}
		if err := rows.Scan(&m.ID, &m.ProductID, &m.TenantID, &m.Quantity, &m.CalculatedCogs); err != nil {
			continue
		}
		if err := w.processMovement(ctx, m.ID, m.ProductID, m.Quantity); err != nil {
			fmt.Printf("[STOCK] Failed to process FIFO for movement %d: %v\n", m.ID, err)
		}
	}

	return nil
}

func (w *FIFOWorker) processMovement(ctx context.Context, movementID int, productID int, quantity decimal.Decimal) error {
	tx, err := w.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	totalCogs := decimal.Zero
	remainingToConsume := quantity

	// Find oldest incoming batches for this product
	rows, err := tx.Query(ctx, `
		SELECT id, remaining_quantity, unit_cost 
		FROM stock_movements 
		WHERE product_id = $1 AND movement_type = 'incoming' AND remaining_quantity > 0 
		ORDER BY created_at ASC`, productID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		if remainingToConsume.IsZero() {
			break
		}

		var batchID int
		var batchRemaining, batchUnitCost decimal.Decimal
		if err := rows.Scan(&batchID, &batchRemaining, &batchUnitCost); err != nil {
			continue
		}

		consume := batchRemaining
		if consume.GreaterThan(remainingToConsume) {
			consume = remainingToConsume
		}

		totalCogs = totalCogs.Add(consume.Mul(batchUnitCost))
		remainingToConsume = remainingToConsume.Sub(consume)

		// Update batch remaining quantity
		_, err = tx.Exec(ctx, "UPDATE stock_movements SET remaining_quantity = remaining_quantity - $1 WHERE id = $2", consume, batchID)
		if err != nil {
			return err
		}
	}

	// Update the outgoing movement with calculated COGS
	_, err = tx.Exec(ctx, "UPDATE stock_movements SET calculated_cogs = $1 WHERE id = $2", totalCogs, movementID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
