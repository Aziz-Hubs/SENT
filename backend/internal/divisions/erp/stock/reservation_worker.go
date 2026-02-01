package stock

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/shopspring/decimal"
)

// ReservationReleaseWorker handles the automatic expiration of stock reservations.
type ReservationReleaseWorker struct {
	river.WorkerDefaults[ReservationReleaseArgs]
	db *pgxpool.Pool
}

func NewReservationReleaseWorker(db *pgxpool.Pool) *ReservationReleaseWorker {
	return &ReservationReleaseWorker{db: db}
}

func (w *ReservationReleaseWorker) Work(ctx context.Context, job *river.Job[ReservationReleaseArgs]) error {
	tx, err := w.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var res struct {
		ID        int
		Status    string
		Quantity  decimal.Decimal
		ProductID int
	}

	err = tx.QueryRow(ctx, `
		SELECT id, status, quantity, product_id 
		FROM inventory_reservations 
		WHERE id = $1 FOR UPDATE`, job.Args.ReservationID).Scan(&res.ID, &res.Status, &res.Quantity, &res.ProductID)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil // Job might have been queued for a deleted reservation
		}
		return err
	}

	// If the reservation is no longer active, we don't need to do anything.
	if res.Status != "active" {
		return nil
	}

	// 1. Mark the reservation as released.
	_, err = tx.Exec(ctx, "UPDATE inventory_reservations SET status = 'released' WHERE id = $1", res.ID)
	if err != nil {
		return fmt.Errorf("failed to release reservation: %w", err)
	}

	// 2. Add the quantity back to the product.
	_, err = tx.Exec(ctx, "UPDATE products SET quantity = quantity + $1 WHERE id = $2", res.Quantity, res.ProductID)
	if err != nil {
		return fmt.Errorf("failed to restore product quantity: %w", err)
	}

	return tx.Commit(ctx)
}
