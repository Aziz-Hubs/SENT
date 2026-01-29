package stock

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/inventoryreservation"
	"entgo.io/ent/dialect/sql"

	"github.com/riverqueue/river"
)

// ReservationReleaseWorker handles the automatic expiration of stock reservations.
type ReservationReleaseWorker struct {
	river.WorkerDefaults[ReservationReleaseArgs]
	db *ent.Client
}

func NewReservationReleaseWorker(db *ent.Client) *ReservationReleaseWorker {
	return &ReservationReleaseWorker{db: db}
}

func (w *ReservationReleaseWorker) Work(ctx context.Context, job *river.Job[ReservationReleaseArgs]) error {
	tx, err := w.db.Tx(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	res, err := tx.InventoryReservation.Query().
		Where(inventoryreservation.ID(job.Args.ReservationID)).
		WithProduct().
		Modify(func(s *sql.Selector) {
			s.ForUpdate()
		}).
		Only(ctx)

	if err != nil {
		tx.Rollback()
		if ent.IsNotFound(err) {
			return nil // Job might have been queued for a deleted reservation
		}
		return err
	}

	// If the reservation is no longer active, we don't need to do anything.
	if res.Status != inventoryreservation.StatusActive {
		tx.Rollback()
		return nil
	}

	// 1. Mark the reservation as released.
	err = tx.InventoryReservation.UpdateOne(res).
		SetStatus(inventoryreservation.StatusReleased).
		Exec(ctx)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to release reservation: %w", err)
	}

	// 2. Add the quantity back to the product.
	err = tx.Product.UpdateOne(res.Edges.Product).
		AddQuantity(res.Quantity).
		Exec(ctx)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to restore product quantity: %w", err)
	}

	return tx.Commit()
}
