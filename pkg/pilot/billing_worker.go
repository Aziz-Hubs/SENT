package pilot

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/timeentry"
	"sent/ent/servicerate"
	"sent/ent/contract"
	"sent/ent/account"
	"sent/ent/ledgerentry"
	"sent/ent/tenant"

	"github.com/riverqueue/river"
	"github.com/shopspring/decimal"
)

// BillingSyncArgs defines the arguments for the billing sync job.
type BillingSyncArgs struct {
	TimeEntryID int `json:"time_entry_id"`
}

func (BillingSyncArgs) Kind() string { return "pilot:billing_sync" }

// BillingSyncWorker automates the transition from Work Performed to Revenue Recognized.
type BillingSyncWorker struct {
	river.WorkerDefaults[BillingSyncArgs]
	db *ent.Client
}

func NewBillingSyncWorker(db *ent.Client) *BillingSyncWorker {
	return &BillingSyncWorker{db: db}
}

func (w *BillingSyncWorker) Work(ctx context.Context, job *river.Job[BillingSyncArgs]) error {
	// 1. Fetch TimeEntry with relations
	te, err := w.db.TimeEntry.Query().
		Where(timeentry.ID(job.Args.TimeEntryID)).
		WithTicket(func(q *ent.TicketQuery) {
			q.WithTenant()
		}).
		Only(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch time entry: %w", err)
	}

	if te.Status != timeentry.StatusApproved {
		return nil // Already processed or not yet approved
	}

	tenantObj := te.Edges.Ticket.Edges.Tenant

	// 2. Fetch ServiceRate
	rateObj, err := w.db.ServiceRate.Query().
		Where(servicerate.WorkType(te.WorkType)).
		Where(servicerate.HasTenantWith(tenant.ID(tenantObj.ID))).
		Only(ctx)
	if err != nil {
		return fmt.Errorf("service rate not found for work type %s: %w", te.WorkType, err)
	}

	// 3. Calculate Amount
	duration := decimal.NewFromFloat(te.DurationHours)
	rate := rateObj.Rate
	amount := duration.Mul(rate).RoundBank(2)

	// 4. Start Transaction
	tx, err := w.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 5. Check for Pre-paid Block Contract
	cnt, _ := tx.Contract.Query().
		Where(contract.HasTenantWith(tenant.ID(tenantObj.ID))).
		Where(contract.TypeEQ(contract.TypeBlockHours)).
		Where(contract.IsActive(true)).
		Only(ctx)

	var arAccNum, revAccNum string
	var description string

	if cnt != nil {
		// Decrement Unearned Revenue liability
		arAccNum = "2100" // Unearned Revenue (Liability)
		revAccNum = "4000" // Service Revenue (Revenue)
		description = fmt.Sprintf("Revenue Recognition from Block Contract %d (TimeEntry %d)", cnt.ID, te.ID)
		
		// Note: The pilot/billing.go already handles decrementing remaining_hours
	} else {
		// Standard Billing: Debit AR, Credit Service Revenue
		arAccNum = "1200" // Accounts Receivable (Asset)
		revAccNum = "4000" // Service Revenue (Revenue)
		description = fmt.Sprintf("Standard Billing for TimeEntry %d", te.ID)
	}

	// 6. Generate Journal Entry
	arAcc, err := tx.Account.Query().Where(account.Number(arAccNum)).Where(account.HasTenantWith(tenant.ID(tenantObj.ID))).Only(ctx)
	if err != nil {
		return fmt.Errorf("account %s not found: %w", arAccNum, err)
	}
	revAcc, err := tx.Account.Query().Where(account.Number(revAccNum)).Where(account.HasTenantWith(tenant.ID(tenantObj.ID))).Only(ctx)
	if err != nil {
		return fmt.Errorf("account %s not found: %w", revAccNum, err)
	}

	txn, err := tx.Transaction.Create().
		SetDescription(description).
		SetDate(time.Now()).
		SetTenant(tenantObj).
		Save(ctx)
	if err != nil {
		return err
	}

	// Ledger Entry 1 (Debit)
	direction1 := ledgerentry.DirectionDebit
	if cnt != nil {
		// For liability (Unearned Revenue), Debit decreases balance
		tx.Account.UpdateOne(arAcc).SetBalance(arAcc.Balance.Sub(amount)).Exec(ctx)
	} else {
		// For asset (AR), Debit increases balance
		tx.Account.UpdateOne(arAcc).SetBalance(arAcc.Balance.Add(amount)).Exec(ctx)
	}

	_, err = tx.LedgerEntry.Create().
		SetAmount(amount).
		SetDirection(direction1).
		SetAccount(arAcc).
		SetTransaction(txn).
		SetTenant(tenantObj).
		Save(ctx)
	if err != nil {
		return err
	}

	// Ledger Entry 2 (Credit)
	direction2 := ledgerentry.DirectionCredit
	tx.Account.UpdateOne(revAcc).SetBalance(revAcc.Balance.Add(amount)).Exec(ctx)

	_, err = tx.LedgerEntry.Create().
		SetAmount(amount).
		SetDirection(direction2).
		SetAccount(revAcc).
		SetTransaction(txn).
		SetTenant(tenantObj).
		Save(ctx)
	if err != nil {
		return err
	}

	// 7. Update TimeEntry
	err = tx.TimeEntry.UpdateOne(te).
		SetStatus(timeentry.StatusBilled).
		SetInvoiceID(txn.ID). // Using Transaction ID as reference
		Exec(ctx)
	if err != nil {
		return err
	}

	return tx.Commit()
}
