package stock

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/product"
	"sent/ent/stockmovement"
)

type FIFOWorker struct {
	db *ent.Client
}

func NewFIFOWorker(db *ent.Client) *FIFOWorker {
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
	pending, err := w.db.StockMovement.Query().
		Where(
			stockmovement.MovementTypeEQ(stockmovement.MovementTypeOutgoing),
			stockmovement.CalculatedCogsIsNil(),
		).
		WithProduct().
		WithTenant().
		All(ctx)

	if err != nil {
		return err
	}

	for _, m := range pending {
		if err := w.processMovement(ctx, m); err != nil {
			fmt.Printf("[STOCK] Failed to process FIFO for movement %d: %v\n", m.ID, err)
		}
	}

	return nil
}

func (w *FIFOWorker) processMovement(ctx context.Context, m *ent.StockMovement) error {
	if m.Edges.Product == nil {
		return fmt.Errorf("movement %d has no associated product", m.ID)
	}

	tx, err := w.db.Tx(ctx)
	if err != nil {
		return err
	}

	totalCogs := 0.0
	remainingToConsume := m.Quantity
	prodID := m.Edges.Product.ID

	// Find oldest incoming batches for this product
	batches, err := tx.StockMovement.Query().
		Where(
			stockmovement.HasProductWith(product.ID(prodID)),
			stockmovement.MovementTypeEQ(stockmovement.MovementTypeIncoming),
			stockmovement.RemainingQuantityGT(0),
		).
		Order(ent.Asc(stockmovement.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		tx.Rollback()
		return err
	}

	for _, batch := range batches {
		if remainingToConsume <= 0 {
			break
		}

		if batch.RemainingQuantity == nil {
			continue
		}

		consume := *batch.RemainingQuantity
		if consume > remainingToConsume {
			consume = remainingToConsume
		}

		totalCogs += consume * batch.UnitCost
		remainingToConsume -= consume

		// Update batch remaining quantity
		newRemaining := *batch.RemainingQuantity - consume
		err = tx.StockMovement.UpdateOne(batch).
			SetRemainingQuantity(newRemaining).
			Exec(ctx)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	// Update the outgoing movement with calculated COGS
	err = tx.StockMovement.UpdateOne(m).
		SetCalculatedCogs(totalCogs).
		Exec(ctx)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}