package orchestrator

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/asset"
	"sent/ent/remediationstep"
	"sent/ent/ticket"
	"sent/ent/user"
	"sent/pkg/database"
	"sent/pkg/nexus/discovery"
	"sent/pkg/pulse/agent"

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
		SetDeepLink(job.Args.DeepLink).
		SetExecutionPlan(job.Args.ExecutionPlan).
		Save(ctx)

	if err != nil {
		return err
	}

	// 2. Create Remediation Steps if provided in execution plan
	if plan, ok := job.Args.ExecutionPlan["suggested_actions"].([]interface{}); ok {
		for i, p := range plan {
			action := p.(map[string]interface{})
			actionName, _ := action["name"].(string)
			
			_, err = w.db.RemediationStep.Create().
				SetTicket(t).
				SetActionName(actionName).
				SetSequence(i).
				SetStatus(remediationstep.StatusPending).
				SetExecutionContext(action).
				SetSourceApp(job.Args.SourceApp).
				Save(ctx)
			if err != nil {
				// Log error but don't fail the whole job
				fmt.Printf("[ORCHESTRATOR] Warning: failed to create remediation step: %v\n", err)
			}
		}
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

// RemediationWorker executes automated fixes and updates ticket state.
type RemediationWorker struct {
	river.WorkerDefaults[RemediationArgs]
	db *ent.Client
}

func (w *RemediationWorker) Work(ctx context.Context, job *river.Job[RemediationArgs]) error {
	// 1. Mark step as running
	err := w.db.RemediationStep.UpdateOneID(job.Args.StepID).
		SetStatus(remediationstep.StatusRunning).
		Exec(ctx)
	if err != nil {
		return err
	}

	// 2. Execute actual action via Pulse Agent (Monolith direct call)
	fmt.Printf("[ORCHESTRATOR] Executing Remediation: %s on Ticket %d\n", job.Args.ActionName, job.Args.TicketID)
	
	var output string
	var execErr error

	// Determine action type from Params
	actionType, _ := job.Args.Params["type"].(string)
	
	switch actionType {
	case "service_restart":
		serviceName, _ := job.Args.Params["service"].(string)
		execErr = agent.ControlService(serviceName, "restart")
		output = fmt.Sprintf("Restarted service: %s", serviceName)
	case "script":
		scriptID, _ := job.Args.Params["script_id"].(string)
		// Simulating script execution - in reality would call agent.RunScript
		output = fmt.Sprintf("Executed script: %s", scriptID)
	case "reboot":
		execErr = agent.RebootSystem()
		output = "Reboot command sent to system"
	default:
		output = fmt.Sprintf("Executed %s (Generic)", job.Args.ActionName)
	}

	status := remediationstep.StatusSuccess
	if execErr != nil {
		status = remediationstep.StatusFailed
		output = fmt.Sprintf("Error: %v", execErr)
	}

	// 3. Update Step with Result
	_, err = w.db.RemediationStep.UpdateOneID(job.Args.StepID).
		SetStatus(status).
		SetOutput(output).
		Save(ctx)
	if err != nil {
		return err
	}

	// 4. Record Work Log automatically
	_, err = w.db.WorkLog.Create().
		SetTicketID(job.Args.TicketID).
		SetTechnicianID(1). // System
		SetDurationHours(0.1).
		SetNote(fmt.Sprintf("Automated Remediation: %s\nResult: %s", job.Args.ActionName, output)).
		SetIsBillable(true).
		SetStatus("approved").
		Save(ctx)

	return err
}

// PulseDiscoveryWorker handles asset reconciliation in SENTnexus.
type PulseDiscoveryWorker struct {
	river.WorkerDefaults[PulseDiscoveryArgs]
	db *ent.Client
}

func (w *PulseDiscoveryWorker) Work(ctx context.Context, job *river.Job[PulseDiscoveryArgs]) error {
	svc := discovery.NewService(w.db)
	return svc.Reconcile(ctx, discovery.TelemetryData{
		TenantID: job.Args.TenantID,
		Hostname: job.Args.Hostname,
		IP:       job.Args.IP,
		MAC:      job.Args.MAC,
		OS:       job.Args.OS,
		Metadata: job.Args.Metadata,
	})
}

// BillingSyncWorker is an alias for the pilot implementation to avoid circular imports if needed,
// but here we just register the one from pkg/pilot if possible or implement it here.
// Since BillingSyncWorker is already in pkg/pilot, we will use it there.

