package vault

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"sent/ent"
	"sent/ent/vaultitem"
	"sent/pkg/orchestrator"
	"sent/pkg/vault/ai"

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
	blockPath := filepath.Join(StorageRoot, BlocksDir, hash)

	// 2. Perform OCR using abstracted engine
	if currentOCREngine == nil {
		log.Printf("[OCR] No OCR engine available")
		return nil
	}

	text, err := currentOCREngine.ExtractText(blockPath)
	if err != nil {
		return fmt.Errorf("failed to extract text: %w", err)
	}

	if text == "" {
		log.Printf("[OCR] No text found for VaultItem %d, skipping update", vaultItemID)
		return nil
	}

	// 3. AI Classification
	classification := ai.ClassifyDocument(text)
	log.Printf("[OCR] Classified VaultItem %d as %s (Confidence: %.2f)", vaultItemID, classification.FileType, classification.Confidence)

	// 4. Update VaultItem with extracted text and AI tags
	err = w.db.VaultItem.Update().
		Where(vaultitem.ID(vaultItemID)).
		SetContent(text).
		SetFileType(classification.FileType).
		Exec(ctx)

	if err != nil {
		return fmt.Errorf("failed to update vault item: %w", err)
	}

	log.Printf("[OCR] Successfully processed VaultItem %d (Extracted %d chars)", vaultItemID, len(text))
	return nil
}
