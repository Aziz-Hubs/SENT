package control

import (
	"context"
	"fmt"
	"log"

	"github.com/riverqueue/river"
)

type KillSwitchArgs struct {
	UserID int `json:"user_id"`
}

func (KillSwitchArgs) Kind() string { return "kill_switch" }

type KillSwitchWorker struct {
	// An implementation of Worker is required.
	river.WorkerDefaults[KillSwitchArgs]
}

func (w *KillSwitchWorker) Work(ctx context.Context, job *river.Job[KillSwitchArgs]) error {
	userID := job.Args.UserID
	log.Printf("[KILLSWITCH] Starting offboarding for User ID: %d", userID)

	// Phase 1: Revoke Sessions
	if err := w.revokeSessions(ctx, userID); err != nil {
		return fmt.Errorf("failed to revoke sessions: %w", err)
	}

	// Phase 2: Wait for Manager Approval
	// In a real system, this would be a separate state/job or wait for an external signal.
	// For MVP, we'll log it.
	log.Printf("[KILLSWITCH] Waiting for manager approval via SENTchat for User %d", userID)

	// Phase 3: Archive Data (SENTvault)
	if err := w.archiveData(ctx, userID); err != nil {
		return fmt.Errorf("failed to archive data: %w", err)
	}

	// Phase 4: Final Suspension
	if err := w.suspendAccount(ctx, userID); err != nil {
		return fmt.Errorf("failed to suspend account: %w", err)
	}

	log.Printf("[KILLSWITCH] Successfully offboarded User ID: %d", userID)
	return nil
}

func (w *KillSwitchWorker) revokeSessions(ctx context.Context, userID int) error {
	// TODO: Call Zitadel/Provider APIs to revoke all active sessions
	return nil
}

func (w *KillSwitchWorker) archiveData(ctx context.Context, userID int) error {
	// TODO: Call SENTvault to create an encrypted container of user data
	return nil
}

func (w *KillSwitchWorker) suspendAccount(ctx context.Context, userID int) error {
	// TODO: Set account status to suspended in the database and providers
	return nil
}
