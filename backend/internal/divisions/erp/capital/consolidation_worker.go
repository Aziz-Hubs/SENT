package capital

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type ConsolidationWorker struct {
	pool *pgxpool.Pool
}

func NewConsolidationWorker(pool *pgxpool.Pool) *ConsolidationWorker {
	return &ConsolidationWorker{pool: pool}
}

type ConsolidatedBalance struct {
	AccountName   string
	AccountNumber string
	TotalBalance  decimal.Decimal
}

func (w *ConsolidationWorker) Run(ctx context.Context) error {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	fmt.Println("[CAPITAL] Consolidation worker started.")

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.ConsolidateAll(ctx); err != nil {
				fmt.Printf("[CAPITAL] Consolidation error: %v\n", err)
			}
		}
	}
}

func (w *ConsolidationWorker) ConsolidateAll(ctx context.Context) error {
	// 1. Find all parent tenants (those without a parent_id)
	rows, err := w.pool.Query(ctx, "SELECT id, name FROM tenants WHERE parent_id IS NULL")
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var pID int
		var pName string
		if err := rows.Scan(&pID, &pName); err != nil {
			continue
		}

		// Use a transaction for consistent snapshot during consolidation
		tx, err := w.pool.Begin(ctx)
		if err != nil {
			fmt.Printf("[CAPITAL] Error creating transaction for tenant %s: %v\n", pName, err)
			continue
		}

		balances, err := w.GenerateConsolidatedTrialBalance(ctx, pID, tx)
		if err != nil {
			tx.Rollback(ctx)
			fmt.Printf("[CAPITAL] Error consolidating for tenant %s: %v\n", pName, err)
			continue
		}

		if err := tx.Commit(ctx); err != nil {
			fmt.Printf("[CAPITAL] Error committing consolidation for tenant %s: %v\n", pName, err)
			continue
		}

		fmt.Printf("[CAPITAL] Consolidated Trial Balance for %s generated (%d accounts)\n", pName, len(balances))
	}

	return nil
}

func (w *ConsolidationWorker) GenerateConsolidatedTrialBalance(ctx context.Context, parentID int, tx pgx.Tx) ([]ConsolidatedBalance, error) {
	// 1. Get parent and all children IDs
	rows, err := tx.Query(ctx, "SELECT id FROM tenants WHERE id = $1 OR parent_id = $1", parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tenantIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err == nil {
			tenantIDs = append(tenantIDs, id)
		}
	}

	if len(tenantIDs) == 0 {
		return nil, nil
	}

	// 2. Fetch all accounts for these tenants
	// We use standard SQL IN clause which might be tricky with pgx slices, so we'll use a subquery or ANY
	accountRows, err := tx.Query(ctx, `
		SELECT name, number, balance, is_intercompany 
		FROM accounts 
		WHERE tenant_id = ANY($1)`, tenantIDs)
	if err != nil {
		return nil, err
	}
	defer accountRows.Close()

	// 3. Aggregate balances by account number
	agg := make(map[string]*ConsolidatedBalance)
	for accountRows.Next() {
		var name, number string
		var balance decimal.Decimal
		var isIntercompany bool
		if err := accountRows.Scan(&name, &number, &balance, &isIntercompany); err != nil {
			continue
		}

		if isIntercompany {
			continue // Elimination
		}

		if _, ok := agg[number]; !ok {
			agg[number] = &ConsolidatedBalance{
				AccountName:   name,
				AccountNumber: number,
				TotalBalance:  decimal.Zero,
			}
		}
		agg[number].TotalBalance = agg[number].TotalBalance.Add(balance)
	}

	result := make([]ConsolidatedBalance, 0, len(agg))
	for _, b := range agg {
		result = append(result, *b)
	}

	return result, nil
}
