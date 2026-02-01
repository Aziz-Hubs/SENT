package capital

import (
	"context"
	"fmt"
	"time"

	"sent/internal/platform/database"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"
	"github.com/riverqueue/river"
	"github.com/shopspring/decimal"
)

// RecurringInvoiceArgs defines the arguments for the recurring billing job.
type RecurringInvoiceArgs struct {
	RecurringInvoiceID int `json:"recurring_invoice_id"`
}

func (RecurringInvoiceArgs) Kind() string { return "capital:recurring_invoice" }

// RecurringInvoiceWorker handles the generation of invoices and ledger entries.
type RecurringInvoiceWorker struct {
	river.WorkerDefaults[RecurringInvoiceArgs]
	pool *pgxpool.Pool
}

func NewRecurringInvoiceWorker(pool *pgxpool.Pool) *RecurringInvoiceWorker {
	return &RecurringInvoiceWorker{pool: pool}
}

func (w *RecurringInvoiceWorker) Work(ctx context.Context, job *river.Job[RecurringInvoiceArgs]) error {
	// 1. Fetch the recurring invoice configuration
	var ri struct {
		ID          int
		TenantID    int
		AccountID   int
		Amount      decimal.Decimal
		IsActive    bool
		Frequency   string
		Description string
		NextRunDate time.Time
		Currency    string
	}

	err := w.pool.QueryRow(ctx, `
		SELECT id, tenant_id, account_id, amount, is_active, frequency, description, next_run_date, currency 
		FROM recurring_invoices WHERE id = $1`, job.Args.RecurringInvoiceID).Scan(
		&ri.ID, &ri.TenantID, &ri.AccountID, &ri.Amount, &ri.IsActive, &ri.Frequency, &ri.Description, &ri.NextRunDate, &ri.Currency)
	if err != nil {
		return fmt.Errorf("failed to fetch recurring invoice: %w", err)
	}

	if !ri.IsActive {
		return nil
	}

	// 2. Start database transaction
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 4. Generate Journal Entry
	var arAccID int
	err = tx.QueryRow(ctx, "SELECT id FROM accounts WHERE number = '1200' AND tenant_id = $1", ri.TenantID).Scan(&arAccID)
	if err != nil {
		return fmt.Errorf("accounts receivable (1200) not found: %w", err)
	}

	var txnID int
	err = tx.QueryRow(ctx, `
		INSERT INTO transactions (description, date, tenant_id) 
		VALUES ($1, $2, $3) RETURNING id`,
		fmt.Sprintf("Recurring Invoice: %s", ri.Description), time.Now(), ri.TenantID).Scan(&txnID)
	if err != nil {
		return err
	}

	// Debit AR
	_, err = tx.Exec(ctx, `
		INSERT INTO journal_entries (amount, direction, account_id, transaction_id, tenant_id) 
		VALUES ($1, 'debit', $2, $3, $4)`,
		ri.Amount, arAccID, txnID, ri.TenantID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO ledger_entries (amount, direction, account_id, transaction_id, tenant_id) 
		VALUES ($1, 'debit', $2, $3, $4)`,
		ri.Amount, arAccID, txnID, ri.TenantID)
	if err != nil {
		return err
	}

	// Credit Revenue
	_, err = tx.Exec(ctx, `
		INSERT INTO journal_entries (amount, direction, account_id, transaction_id, tenant_id) 
		VALUES ($1, 'credit', $2, $3, $4)`,
		ri.Amount, ri.AccountID, txnID, ri.TenantID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO ledger_entries (amount, direction, account_id, transaction_id, tenant_id) 
		VALUES ($1, 'credit', $2, $3, $4)`,
		ri.Amount, ri.AccountID, txnID, ri.TenantID)
	if err != nil {
		return err
	}

	// Update Account Balances
	_, err = tx.Exec(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", ri.Amount, arAccID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", ri.Amount, ri.AccountID)
	if err != nil {
		return err
	}

	// 5. Update Recurring Invoice state
	nextRun := w.calculateNextRun(ri.NextRunDate, ri.Frequency)
	_, err = tx.Exec(ctx, `
		UPDATE recurring_invoices 
		SET last_run_date = NOW(), next_run_date = $1 
		WHERE id = $2`, nextRun, ri.ID)
	if err != nil {
		return err
	}

	// 7. Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	// 8. Log Audit
	database.LogAuditRecord(ctx, w.pool, ri.TenantID, "SENTcapital", "recurring_invoice_generated", "system", map[string]interface{}{
		"invoice_id": ri.ID,
		"amount":     ri.Amount,
	})

	return nil
}

func (w *RecurringInvoiceWorker) calculateNextRun(current time.Time, frequency string) time.Time {
	switch frequency {
	case "quarterly":
		return current.AddDate(0, 3, 0)
	case "yearly":
		return current.AddDate(1, 0, 0)
	default: // monthly
		return current.AddDate(0, 1, 0)
	}
}

func (w *RecurringInvoiceWorker) generatePDFInvoice(description string, amount decimal.Decimal, currency string) error {
	cfg := config.NewBuilder().Build()
	m := maroto.New(cfg)

	m.AddRows(row.New(20).Add(
		text.NewCol(12, "INVOICE", props.Text{
			Size:  16,
			Style: fontstyle.Bold,
			Align: align.Center,
		}),
	))

	m.AddRows(row.New(10).Add(
		text.NewCol(6, fmt.Sprintf("Description: %s", description), props.Text{Size: 10}),
		text.NewCol(6, fmt.Sprintf("Date: %s", time.Now().Format("2006-01-02")), props.Text{Size: 10, Align: align.Right}),
	))

	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Total Amount: %s %s", amount.StringFixed(2), currency), props.Text{
			Size:  12,
			Style: fontstyle.Bold,
			Align: align.Right,
		}),
	))

	return nil
}
