package vault

import (
	"context"
	"fmt"
	"log"
	"sent/ent"
	"sent/ent/vaultitem"
	"sent/pkg/orchestrator"

	"github.com/riverqueue/river"
)

type OCRWorker struct {
	river.WorkerDefaults[orchestrator.OCRArgs]
	db *ent.Client
}

func NewOCRWorker(db *ent.Client) *OCRWorker {
	return &OCRWorker{db: db}
}

func (w *OCRWorker) Work(ctx context.Context, job *river.Job[orchestrator.OCRArgs]) error {
	vaultItemID := job.Args.VaultItemID
	hash := job.Args.Hash

	log.Printf("[OCR] Processing VaultItem %d (Hash: %s)", vaultItemID, hash)

	// 1. Get the file from storage/blocks/<hash>
	// 2. Perform OCR (Mocked for now)
	extractedText := fmt.Sprintf("Extracted text for block %s. Real OCR implementation would go here.", hash)

	// 3. Update VaultItem with extracted text
	err := w.db.VaultItem.Update().
		Where(vaultitem.ID(vaultItemID)).
		SetContent(extractedText).
		Exec(ctx)

	if err != nil {
		return fmt.Errorf("failed to update vault item content: %w", err)
	}

	log.Printf("[OCR] Successfully processed VaultItem %d", vaultItemID)
	return nil
}
