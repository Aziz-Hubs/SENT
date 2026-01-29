package capital

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/recurringinvoice"
	"sent/ent/account"
	"sent/ent/journalentry"
	"sent/ent/ledgerentry"
	"sent/pkg/database"

	"github.com/riverqueue/river"
	"github.com/shopspring/decimal"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

// RecurringInvoiceArgs defines the arguments for the recurring billing job.
type RecurringInvoiceArgs struct {
	RecurringInvoiceID int `json:"recurring_invoice_id"`
}

func (RecurringInvoiceArgs) Kind() string { return "capital:recurring_invoice" }

// RecurringInvoiceWorker handles the generation of invoices and ledger entries.
type RecurringInvoiceWorker struct {
	river.WorkerDefaults[RecurringInvoiceArgs]
	db *ent.Client
}

func NewRecurringInvoiceWorker(db *ent.Client) *RecurringInvoiceWorker {
	return &RecurringInvoiceWorker{db: db}
}

func (w *RecurringInvoiceWorker) Work(ctx context.Context, job *river.Job[RecurringInvoiceArgs]) error {
	// 1. Fetch the recurring invoice configuration
	ri, err := w.db.RecurringInvoice.Query().
		Where(recurringinvoice.ID(job.Args.RecurringInvoiceID)).
		WithAccount().
		WithTenant().
		Only(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch recurring invoice: %w", err)
	}

	if !ri.IsActive {
		return nil
	}

	// 2. Start database transaction
	tx, err := w.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 3. Precision Math with shopspring/decimal
	amount := decimal.NewFromFloat(ri.Amount)
	
	// 4. Generate Journal Entry
	arAcc, err := tx.Account.Query().Where(account.Number("1200")).Only(ctx)
	if err != nil {
		return fmt.Errorf("accounts receivable (1200) not found: %w", err)
	}

	revAcc := ri.Edges.Account

	txn, err := tx.Transaction.Create().
		SetDescription(fmt.Sprintf("Recurring Invoice: %s", ri.Description)).
		SetDate(time.Now()).
		SetTenant(ri.Edges.Tenant).
		Save(ctx)
	if err != nil {
		return err
	}

	// Debit AR
	_, err = tx.JournalEntry.Create().
		SetAmount(ri.Amount).
		SetDirection(journalentry.DirectionDebit).
		SetAccount(arAcc).
		SetTransaction(txn).
		SetTenant(ri.Edges.Tenant).
		Save(ctx)
	if err != nil {
		return err
	}

	_, err = tx.LedgerEntry.Create().
		SetAmount(ri.Amount).
		SetDirection(ledgerentry.DirectionDebit).
		SetAccount(arAcc).
		SetTransaction(txn).
		SetTenant(ri.Edges.Tenant).
		Save(ctx)
	if err != nil {
		return err
	}

	// Credit Revenue
	_, err = tx.JournalEntry.Create().
		SetAmount(ri.Amount).
		SetDirection(journalentry.DirectionCredit).
		SetAccount(revAcc).
		SetTransaction(txn).
		SetTenant(ri.Edges.Tenant).
		Save(ctx)
	if err != nil {
		return err
	}

	_, err = tx.LedgerEntry.Create().
		SetAmount(ri.Amount).
		SetDirection(ledgerentry.DirectionCredit).
		SetAccount(revAcc).
		SetTransaction(txn).
		SetTenant(ri.Edges.Tenant).
		Save(ctx)
	if err != nil {
		return err
	}

	// Update Account Balances
	newArBal, _ := decimal.NewFromFloat(arAcc.Balance).Add(amount).Float64()
	newRevBal, _ := decimal.NewFromFloat(revAcc.Balance).Add(amount).Float64()

	tx.Account.UpdateOne(arAcc).SetBalance(newArBal).Exec(ctx)
	tx.Account.UpdateOne(revAcc).SetBalance(newRevBal).Exec(ctx)

	// 5. Update Recurring Invoice state
	nextRun := w.calculateNextRun(ri.NextRunDate, ri.Frequency)
	err = tx.RecurringInvoice.UpdateOne(ri).
		SetLastRunDate(time.Now()).
		SetNextRunDate(nextRun).
		Exec(ctx)
	if err != nil {
		return err
	}

	// 6. Generate PDF Invoice
	_ = w.generatePDFInvoice(ri, amount)

	// 7. Commit transaction
	if err := tx.Commit(); err != nil {
		return err
	}

	// 8. Log Audit
	database.LogAuditRecord(ctx, w.db, ri.Edges.Tenant.ID, "SENTcapital", "recurring_invoice_generated", "system", map[string]interface{}{
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

func (w *RecurringInvoiceWorker) generatePDFInvoice(ri *ent.RecurringInvoice, amount decimal.Decimal) error {
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
		text.NewCol(6, fmt.Sprintf("Description: %s", ri.Description), props.Text{Size: 10}),
		text.NewCol(6, fmt.Sprintf("Date: %s", time.Now().Format("2006-01-02")), props.Text{Size: 10, Align: align.Right}),
	))

	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Total Amount: %s %s", amount.StringFixed(2), ri.Currency), props.Text{
			Size:  12,
			Style: fontstyle.Bold,
			Align: align.Right,
		}),
	))

	return nil
}