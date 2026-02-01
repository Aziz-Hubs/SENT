package pilot

import (
	"context"
	"fmt"
	"time"

	capitaldb "sent/internal/db/erp/capital/sqlc"
	pilotdb "sent/internal/db/msp/pilot/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
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
	pool           *pgxpool.Pool
	pilotQueries   *pilotdb.Queries
	capitalQueries *capitaldb.Queries
}

func NewBillingSyncWorker(pool *pgxpool.Pool) *BillingSyncWorker {
	return &BillingSyncWorker{
		pool:           pool,
		pilotQueries:   pilotdb.New(pool),
		capitalQueries: capitaldb.New(pool),
	}
}

func (w *BillingSyncWorker) Work(ctx context.Context, job *river.Job[BillingSyncArgs]) error {
	// 1. Fetch TimeEntry
	te, err := w.pilotQueries.GetTimeEntryWithTicket(ctx, int32(job.Args.TimeEntryID))
	if err != nil {
		return fmt.Errorf("failed to fetch time entry: %w", err)
	}

	if te.Status.String != "approved" {
		return nil // Already processed or not yet approved
	}

	// 2. Fetch ServiceRate (Simplified - taking first available for now)
	// Original code used te.WorkType and te.TenantID
	rateVal, err := w.pilotQueries.GetServiceRate(ctx, pilotdb.GetServiceRateParams{
		TenantID: te.TenantID,
		WorkType: "standard", // Fallback for now if work_type missing in te
	})
	if err != nil {
		return fmt.Errorf("service rate not found: %w", err)
	}
	rateFloat, _ := rateVal.Float64Value()
	rate := decimal.NewFromFloat(rateFloat.Float64)

	// 3. Calculate Amount
	durFloat, _ := te.DurationHours.Float64Value()
	duration := decimal.NewFromFloat(durFloat.Float64)
	amount := rate.Mul(duration).RoundBank(2)

	// 4. Start Transaction
	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	pilotQtx := w.pilotQueries.WithTx(tx)
	capitalQtx := w.capitalQueries.WithTx(tx)

	// 5. Check for Pre-paid Block Contract
	contractID, err := pilotQtx.GetActiveBlockContract(ctx, te.TenantID)
	hasContract := err == nil

	var arAccNum string
	var description string

	if hasContract {
		arAccNum = "2100" // Unearned Revenue (Liability)
		description = fmt.Sprintf("Revenue Recognition from Block Contract %d (TimeEntry %d)", contractID, te.ID)
	} else {
		arAccNum = "1200" // Accounts Receivable (Asset)
		description = fmt.Sprintf("Standard Billing for TimeEntry %d", te.ID)
	}

	// 6. Generate Journal Entry
	arAcc, err := capitalQtx.GetAccountByNumber(ctx, capitaldb.GetAccountByNumberParams{
		Number:   arAccNum,
		TenantID: te.TenantID,
	})
	if err != nil {
		return fmt.Errorf("account %s not found: %w", arAccNum, err)
	}

	revAcc, err := capitalQtx.GetAccountByNumber(ctx, capitaldb.GetAccountByNumberParams{
		Number:   "4000",
		TenantID: te.TenantID,
	})
	if err != nil {
		return fmt.Errorf("account 4000 not found: %w", err)
	}

	var totalAmt pgtype.Numeric
	totalAmt.Scan(fmt.Sprintf("%f", amount.InexactFloat64()))

	txnID, err := capitalQtx.CreateTransaction(ctx, capitaldb.CreateTransactionParams{
		TenantID:    te.TenantID,
		Description: pgtype.Text{String: description, Valid: true},
		TotalAmount: totalAmt,
		Date:        pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
	if err != nil {
		return err
	}

	// Ledger Entry 1 (Debit)
	delta := amount.InexactFloat64()
	if hasContract {
		delta = -delta
	}
	var balDebit pgtype.Numeric
	balDebit.Scan(fmt.Sprintf("%f", delta))

	err = capitalQtx.UpdateAccountBalance(ctx, capitaldb.UpdateAccountBalanceParams{
		Balance: balDebit,
		ID:      arAcc.ID,
	})
	if err != nil {
		return err
	}

	var amtLedger pgtype.Numeric
	amtLedger.Scan(fmt.Sprintf("%f", amount.InexactFloat64()))

	err = capitalQtx.CreateLedgerEntry(ctx, capitaldb.CreateLedgerEntryParams{
		TenantID:      te.TenantID,
		TransactionID: txnID,
		AccountID:     arAcc.ID,
		Amount:        amtLedger,
		Direction:     "debit",
	})
	if err != nil {
		return err
	}

	// Ledger Entry 2 (Credit)
	var balCredit pgtype.Numeric
	balCredit.Scan(fmt.Sprintf("%f", amount.InexactFloat64()))

	err = capitalQtx.UpdateAccountBalance(ctx, capitaldb.UpdateAccountBalanceParams{
		Balance: balCredit,
		ID:      revAcc.ID,
	})
	if err != nil {
		return err
	}

	err = capitalQtx.CreateLedgerEntry(ctx, capitaldb.CreateLedgerEntryParams{
		TenantID:      te.TenantID,
		TransactionID: txnID,
		AccountID:     revAcc.ID,
		Amount:        amtLedger,
		Direction:     "credit",
	})
	if err != nil {
		return err
	}

	// 7. Update TimeEntry
	err = pilotQtx.UpdateTimeEntryStatus(ctx, pilotdb.UpdateTimeEntryStatusParams{
		Status: pgtype.Text{String: "billed", Valid: true},
		ID:     te.ID,
	})
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
