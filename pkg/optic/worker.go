package optic

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"sent/ent"
	"time"
)

// OpticWorker manages the MediaMTX process and background inference tasks.
type OpticWorker struct {
	db *ent.Client
}

// NewOpticWorker initializes the surveillance worker.
func NewOpticWorker(db *ent.Client) *OpticWorker {
	return &OpticWorker{db: db}
}

// Run starts the MediaMTX process and the inference loop.
func (w *OpticWorker) Run(ctx context.Context) error {
	fmt.Println("[OPTIC] Starting SENToptic Worker...")

	// 1. Generate MediaMTX configuration
	if err := w.generateConfig(); err != nil {
		return fmt.Errorf("failed to generate mediamtx config: %w", err)
	}

	// 2. Start MediaMTX process
	// Note: Assumes mediamtx binary is available in PATH or project root
	cmd := exec.CommandContext(ctx, "mediamtx")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start mediamtx: %w", err)
	}

	// 3. Start Inference Loop
	go w.inferenceLoop(ctx)

	// 4. Start Storage Cleanup Loop
	go w.storageLoop(ctx)

	return cmd.Wait()
}

func (w *OpticWorker) generateConfig() error {
	// TODO: Create mediamtx.yml with paths for each camera in DB
	// For now, assume a static config exists or use defaults
	return nil
}

func (w *OpticWorker) inferenceLoop(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// 1. Grab frames from RTSP streams
			// 2. Run TFLite inference
			// 3. Save detections to DB
		}
	}
}

func (w *OpticWorker) storageLoop(ctx context.Context) {
	// Periodic check to delete old recordings or move to Tier 2
}
