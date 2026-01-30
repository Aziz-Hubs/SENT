package capital

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/account"
	"sent/ent/tenant"
	"github.com/shopspring/decimal"
)

type ConsolidationWorker struct {
	db *ent.Client
}

func NewConsolidationWorker(db *ent.Client) *ConsolidationWorker {
	return &ConsolidationWorker{db: db}
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
	// 1. Find all parent tenants
	parents, err := w.db.Tenant.Query().
		Where(tenant.Not(tenant.HasParent())).
		All(ctx)
	if err != nil {
		return err
	}

	for _, p := range parents {
		// Use a transaction for consistent snapshot during consolidation
		tx, err := w.db.Tx(ctx)
		if err != nil {
			fmt.Printf("[CAPITAL] Error creating transaction for tenant %s: %v\n", p.Name, err)
			continue
		}
		
		balances, err := w.GenerateConsolidatedTrialBalance(ctx, p.ID, tx)
		if err != nil {
			tx.Rollback()
			fmt.Printf("[CAPITAL] Error consolidating for tenant %s: %v\n", p.Name, err)
			continue
		}
		
		if err := tx.Commit(); err != nil {
			fmt.Printf("[CAPITAL] Error committing consolidation for tenant %s: %v\n", p.Name, err)
			continue
		}
		
		fmt.Printf("[CAPITAL] Consolidated Trial Balance for %s generated (%d accounts)\n", p.Name, len(balances))
	}

	return nil
}

func (w *ConsolidationWorker) GenerateConsolidatedTrialBalance(ctx context.Context, parentID int, tx *ent.Tx) ([]ConsolidatedBalance, error) {
	// Get parent and all children
	tenants, err := tx.Tenant.Query().
		Where(
			tenant.Or(
				tenant.IDEQ(parentID),
				tenant.HasParentWith(tenant.IDEQ(parentID)),
			),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	tenantIDs := make([]int, len(tenants))
	for i, t := range tenants {
		tenantIDs[i] = t.ID
	}

	// Fetch all accounts for these tenants
	accounts, err := tx.Account.Query().
		Where(account.HasTenantWith(tenant.IDIn(tenantIDs...))).
		All(ctx)
	if err != nil {
		return nil, err
	}

	// Aggregate balances by account number
	// Eliminating inter-company accounts
	agg := make(map[string]*ConsolidatedBalance)
	for _, acc := range accounts {
		if acc.IsIntercompany {
			// Skip inter-company debt/income for consolidated view (Elimination)
			continue
		}

		if _, ok := agg[acc.Number]; !ok {
			agg[acc.Number] = &ConsolidatedBalance{
				AccountName:   acc.Name,
				AccountNumber: acc.Number,
				TotalBalance:  decimal.Zero,
			}
		}
		agg[acc.Number].TotalBalance = agg[acc.Number].TotalBalance.Add(acc.Balance)
	}

	result := make([]ConsolidatedBalance, 0, len(agg))
	for _, b := range agg {
		result = append(result, *b)
	}

	return result, nil
}
