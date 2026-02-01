package orchestrator

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
)

type Orchestrator struct {
	pool    *pgxpool.Pool
	client  *river.Client[pgx.Tx]
	workers *river.Workers
}

func NewOrchestrator(pool *pgxpool.Pool) *Orchestrator {
	workers := river.NewWorkers()
	// Add default workers or logic here if needed

	riverClient, err := river.NewClient(riverpgxv5.New(pool), &river.Config{
		Queues: map[string]river.QueueConfig{
			river.QueueDefault: {MaxWorkers: 100},
		},
		Workers: workers,
	})
	if err != nil {
		// Log error or panic since this is bootstrap
		fmt.Printf("Failed to create river client: %v\n", err)
		return nil
	}

	return &Orchestrator{
		pool:    pool,
		client:  riverClient,
		workers: workers,
	}
}

func (o *Orchestrator) GetClient() *river.Client[pgx.Tx] {
	return o.client
}

func (o *Orchestrator) Workers() *river.Workers {
	return o.workers
}

func (o *Orchestrator) Start(ctx context.Context) error {
	return o.client.Start(ctx)
}

// RegisterStockHooks registers hooks for stock updates.
// Refactored to accept pgxpool since ent is removed.
func RegisterStockHooks(pool *pgxpool.Pool) {
	// Implementation dependent on what hooks did.
	// For now, simple logging as placeholder.
	fmt.Println("RegisterStockHooks called - hooks functionality pending SQLc migration")
}

// TerminationArgs defines arguments for employee termination job
type TerminationArgs struct {
	TenantID  int    `json:"tenant_id"`
	UserID    int    `json:"user_id"`
	ActorID   string `json:"actor_id"`
	ManagerID *int   `json:"manager_id,omitempty"`
}

func (TerminationArgs) Kind() string { return "people:termination" }

// BillingSyncArgs defines arguments for billing synchronization job
type BillingSyncArgs struct {
	TimeEntryID int `json:"time_entry_id"`
}

func (BillingSyncArgs) Kind() string { return "pilot:billing_sync" }

// RemediationArgs defines arguments for automated remediation job
type RemediationArgs struct {
	TenantID      int                    `json:"tenant_id"`
	TicketID      int                    `json:"ticket_id"`
	ActionPlan    string                 `json:"action_plan"`
	AssetID       int                    `json:"asset_id"`
	StepID        int                    `json:"step_id"`
	ActionName    string                 `json:"action_name"`
	Params        map[string]interface{} `json:"params"`
	ExecutionStep int                    `json:"execution_step"`
}

func (RemediationArgs) Kind() string { return "pilot:remediation" }

// SecurityAuditEvent defines arguments for security audit logging
type SecurityAuditEvent struct {
	TenantID  int    `json:"tenant_id"`
	EventType string `json:"event_type"`
	Severity  string `json:"severity"`
	Payload   string `json:"payload"`
	SourceIP  string `json:"source_ip"`
	ActorID   string `json:"actor_id,omitempty"`
	KioskID   int    `json:"kiosk_id,omitempty"`
	Timestamp int64  `json:"timestamp,omitempty"`
}

func (SecurityAuditEvent) Kind() string { return "security:audit_event" }

// IncidentResponseArgs defines arguments for incident response job
type IncidentResponseArgs struct {
	TenantID      int                    `json:"tenant_id"`
	IncidentID    int                    `json:"incident_id"`
	SourceApp     string                 `json:"source_app"`
	DeviceID      int                    `json:"device_id"`
	AlertName     string                 `json:"alert_name"`
	Severity      string                 `json:"severity"`
	Details       string                 `json:"details"`
	DeepLink      string                 `json:"deep_link"`
	ExecutionPlan map[string]interface{} `json:"execution_plan,omitempty"`
	Responder     string                 `json:"responder"`
}

func (IncidentResponseArgs) Kind() string { return "pulse:incident_response" }

// HealthUpdateArgs defines arguments for health recalculation job
type HealthUpdateArgs struct {
	TenantID int `json:"tenant_id"`
}

func (HealthUpdateArgs) Kind() string { return "horizon:health_update" }
