package tax

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/transaction"

	"github.com/google/uuid"
	"github.com/riverqueue/river"
)

// TaxSubmissionArgs defines the arguments for the tax submission job.
type TaxSubmissionArgs struct {
	TransactionID int `json:"transaction_id"`
}

func (TaxSubmissionArgs) Kind() string { return "tax:submission" }

// TaxSubmissionWorker handles the resilient submission of invoices to government portals.
type TaxSubmissionWorker struct {
	river.WorkerDefaults[TaxSubmissionArgs]
	db *ent.Client
}

func NewTaxSubmissionWorker(db *ent.Client) *TaxSubmissionWorker {
	return &TaxSubmissionWorker{db: db}
}

func (w *TaxSubmissionWorker) Work(ctx context.Context, job *river.Job[TaxSubmissionArgs]) error {
	// 1. Fetch transaction
	txn, err := w.db.Transaction.Query().
		Where(transaction.ID(job.Args.TransactionID)).
		Only(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch transaction: %w", err)
	}

	// 2. Strict Idempotency Check (Local)
	// If the transaction already has a government reference, it was already successfully submitted.
	if txn.Reference != "" {
		fmt.Printf("[TAX-WORKER] Transaction %d already cleared with reference %s. Skipping.\n", txn.ID, txn.Reference)
		return nil
	}

	// 3. Simulate Government API Call with Exponential Backoff (handled by River)
	// We use the Transaction UUID as the idempotency key for the government portal.
	err = w.submitToGovernmentPortal(ctx, txn)
	if err != nil {
		// Returning an error here triggers River's exponential backoff retry mechanism.
		return fmt.Errorf("government portal submission failed: %w", err)
	}

	// 4. Update Transaction metadata on success
	err = w.db.Transaction.UpdateOneID(txn.ID).
		SetReference(fmt.Sprintf("GOV-CLEARED-%s", uuid.New().String())).
		Exec(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (w *TaxSubmissionWorker) submitToGovernmentPortal(ctx context.Context, txn *ent.Transaction) error {
	// In a real implementation, this would be an HTTP call to ZATCA/JoFotara/etc.
	// We pass txn.UUID as an 'Idempotency-Key' header.
	fmt.Printf("[TAX-WORKER] Submitting Transaction %d to gov portal. Idempotency Key: %s\n", txn.ID, txn.UUID)
	
	// Mock success
	return nil
}