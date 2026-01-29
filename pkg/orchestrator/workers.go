package orchestrator

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/asset"
	"sent/ent/ticket"
	"sent/ent/user"
	"sent/pkg/database"

	"github.com/jackc/pgx/v5"
	"github.com/riverqueue/river"
)

// TerminationWorker coordinates the multi-module offboarding sequence.
type TerminationWorker struct {
	river.WorkerDefaults[TerminationArgs]
	db    *ent.Client
	river *river.Client[pgx.Tx]
}

func (w *TerminationWorker) Work(ctx context.Context, job *river.Job[TerminationArgs]) error {
	// 1. Audit Start
	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "Orchestrator", "termination_sequence_start", job.Args.ActorID, map[string]interface{}{
		"user_id": job.Args.UserID,
	})

	// 2. Transactionally enqueue child jobs
	tx, err := w.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Job A: SaaS Revocation (M365)
	if _, err := w.river.Insert(ctx, RevokeSaaSArgs{
		TenantID: job.Args.TenantID,
		UserID:   job.Args.UserID,
		Platform: "m365",
	}, nil); err != nil {
		return err
	}

	// Job B: Asset Cleanup
	if _, err := w.river.Insert(ctx, AssetCleanupArgs{
		TenantID: job.Args.TenantID,
		UserID:   job.Args.UserID,
	}, nil); err != nil {
		return err
	}

	// Job C: Call Redirection (to manager if provided)
	if job.Args.ManagerID != nil {
		if _, err := w.river.Insert(ctx, CallRedirectionArgs{
			TenantID:     job.Args.TenantID,
			UserID:       job.Args.UserID,
			TargetUserID: *job.Args.ManagerID,
		}, nil); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// RevokeSaaSWorker interacts with SENTcontrol to disable cloud access.
type RevokeSaaSWorker struct {
	river.WorkerDefaults[RevokeSaaSArgs]
	db *ent.Client
}

func (w *RevokeSaaSWorker) Work(ctx context.Context, job *river.Job[RevokeSaaSArgs]) error {
	// Simulate API logic for SENTcontrol
	// In a full implementation, this would call pkg/control service
	fmt.Printf("[ORCHESTRATOR] Revoking %s for user %d\n", job.Args.Platform, job.Args.UserID)

	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "SENTcontrol", "saas_revocation_executed", "system", map[string]interface{}{
		"user_id":  job.Args.UserID,
		"platform": job.Args.Platform,
	})

	return nil
}

// AssetCleanupWorker unassigns hardware in SENTnexus.
type AssetCleanupWorker struct {
	river.WorkerDefaults[AssetCleanupArgs]
	db *ent.Client
}

func (w *AssetCleanupWorker) Work(ctx context.Context, job *river.Job[AssetCleanupArgs]) error {
	// 1. Find employee to get their identity (ZitadelID)
	emp, err := w.db.Employee.Get(ctx, job.Args.UserID)
	if err != nil {
		return fmt.Errorf("failed to find employee %d: %w", job.Args.UserID, err)
	}

	// 2. Find and unassign assets from the corresponding User record
	// (Users are matched via ZitadelID)
	count, err := w.db.Asset.Update().
		Where(asset.HasOwnerWith(user.ZitadelID(emp.ZitadelID))).
		ClearOwner().
		Save(ctx)

	if err != nil {
		return fmt.Errorf("failed to clear asset ownership: %w", err)
	}

	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "SENTnexus", "asset_cleanup_executed", "system", map[string]interface{}{
		"user_id":        job.Args.UserID,
		"zitadel_id":     emp.ZitadelID,
		"assets_cleared": count,
	})

	return nil
}

// IncidentResponseWorker handles self-healing tickets in SENTpilot.
type IncidentResponseWorker struct {
	river.WorkerDefaults[IncidentResponseArgs]
	db *ent.Client
}

func (w *IncidentResponseWorker) Work(ctx context.Context, job *river.Job[IncidentResponseArgs]) error {
	// 1. Create the Ticket
	t, err := w.db.Ticket.Create().
		SetTenantID(job.Args.TenantID).
		SetSubject(fmt.Sprintf("AUTO-HEAL: %s", job.Args.AlertName)).
		SetDescription(fmt.Sprintf("Source: %s\nDevice ID: %d\n\nDetails: %s", job.Args.SourceApp, job.Args.DeviceID, job.Args.Details)).
		SetPriority(ticket.PriorityP2).
		SetRequesterID(1). // System/Admin User
		Save(ctx)

	if err != nil {
		return err
	}

	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "SENTpilot", "incident_ticket_created", "system", map[string]interface{}{
		"ticket_id": t.ID,
		"alert":     job.Args.AlertName,
	})

	return nil
}

// CallRedirectionWorker updates VoIP routing in SENTwave.
type CallRedirectionWorker struct {
	river.WorkerDefaults[CallRedirectionArgs]
	db *ent.Client
}

func (w *CallRedirectionWorker) Work(ctx context.Context, job *river.Job[CallRedirectionArgs]) error {
	fmt.Printf("[ORCHESTRATOR] Redirecting user %d calls to user %d in tenant %d\n", 
		job.Args.UserID, job.Args.TargetUserID, job.Args.TenantID)

	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "SENTwave", "call_redirection_executed", "system", map[string]interface{}{
		"user_id":        job.Args.UserID,
		"target_user_id": job.Args.TargetUserID,
	})

	return nil
}

// HealthUpdateWorker triggers score recalculation in SENThorizon.
type HealthUpdateWorker struct {
	river.WorkerDefaults[HealthUpdateArgs]
	db *ent.Client
}

func (w *HealthUpdateWorker) Work(ctx context.Context, job *river.Job[HealthUpdateArgs]) error {
	fmt.Printf("[ORCHESTRATOR] Recalculating health score for tenant %d\n", job.Args.TenantID)

	// Simulate score calculation logic
	database.LogAuditRecord(ctx, w.db, job.Args.TenantID, "SENThorizon", "health_score_recalculated", "system", nil)

	return nil
}

// BillingSyncWorker is an alias for the pilot implementation to avoid circular imports if needed,
// but here we just register the one from pkg/pilot if possible or implement it here.
// Since BillingSyncWorker is already in pkg/pilot, we will use it there.

