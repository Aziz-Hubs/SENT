package stock

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
)

type KioskSyncWorker struct {
	db     *ent.Client
	bridge *KioskBridge
	buffer *LocalPOSBuffer
}

func NewKioskSyncWorker(db *ent.Client, bridge *KioskBridge) *KioskSyncWorker {
	return &KioskSyncWorker{
		db:     db,
		bridge: bridge,
		buffer: bridge.buffer,
	}
}

func (w *KioskSyncWorker) Run(ctx context.Context) error {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	fmt.Println("[KIOSK] Sync worker started.")

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.SyncPending(ctx); err != nil {
				fmt.Printf("[KIOSK] Sync error: %v\n", err)
			}
		}
	}
}

func (w *KioskSyncWorker) SyncPending(ctx context.Context) error {
	if w.buffer == nil {
		return nil
	}

	sales, ids, err := w.buffer.GetPending(10)
	if err != nil {
		return err
	}

	if len(sales) == 0 {
		return nil
	}

	fmt.Printf("[KIOSK] Syncing %d buffered sales...\n", len(sales))

	for i, sale := range sales {
		_, err := w.bridge.performCheckout(sale)
		if err != nil {
			// If it fails, we stop syncing and try again later
			return fmt.Errorf("failed to sync sale %d: %w", ids[i], err)
		}
		
		// Successfully synced, remove from buffer
		if err := w.buffer.DeleteBuffered([]int64{ids[i]}); err != nil {
			fmt.Printf("[KIOSK] Warning: failed to delete synced sale %d from buffer: %v\n", ids[i], err)
		}
	}

	fmt.Println("[KIOSK] Sync batch completed.")
	return nil
}
