package pilot

import (
	"context"
	"fmt"
	pilotdb "sent/internal/db/msp/pilot/sqlc"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PlaybookEngine orchestrates multi-step remediation.
type PlaybookEngine struct {
	pool    *pgxpool.Pool
	queries *pilotdb.Queries
}

// NewPlaybookEngine initializes the PlaybookEngine.
func NewPlaybookEngine(pool *pgxpool.Pool) *PlaybookEngine {
	return &PlaybookEngine{
		pool:    pool,
		queries: pilotdb.New(pool),
	}
}

// TriggerPlaybook starts a chained sequence of actions.
func (e *PlaybookEngine) TriggerPlaybook(ctx context.Context, ticketID int, playbookName string) error {
	// 1. Fetch TenantID from ticket
	tenantID, err := e.queries.GetTicketTenantID(ctx, int32(ticketID))
	if err != nil {
		return fmt.Errorf("failed to fetch tenant ID: %w", err)
	}

	// 2. Define sequence (Mock for now)
	steps := []string{"Stop Service", "Clear Cache", "Restart Service"}

	for i, name := range steps {
		stepID, err := e.queries.CreateRemediationStep(ctx, pilotdb.CreateRemediationStepParams{
			TenantID:   tenantID,
			TicketID:   int32(ticketID),
			ActionName: name,
			Sequence:   int32(i),
		})
		if err != nil {
			return fmt.Errorf("failed to create remediation step: %w", err)
		}

		// Execute step synchronously for mock, in reality this would be async
		if err := e.executeStep(ctx, int(stepID), name); err != nil {
			return fmt.Errorf("playbook failed at step %s: %w", name, err)
		}
	}

	return nil
}

func (e *PlaybookEngine) executeStep(ctx context.Context, stepID int, actionName string) error {
	// Update to running
	err := e.queries.UpdateRemediationStepStatus(ctx, pilotdb.UpdateRemediationStepStatusParams{
		Status: pgtype.Text{String: "running", Valid: true},
		ID:     int32(stepID),
	})
	if err != nil {
		return err
	}

	// Simulate SENTpulse agent call
	time.Sleep(1 * time.Second)

	success := true // Mock result

	status := "success"
	if !success {
		status = "failed"
	}

	err = e.queries.UpdateRemediationStepOutput(ctx, pilotdb.UpdateRemediationStepOutputParams{
		Status: pgtype.Text{String: status, Valid: true},
		Output: pgtype.Text{String: fmt.Sprintf("Executed %s successfully", actionName), Valid: true},
		ID:     int32(stepID),
	})

	if !success {
		return fmt.Errorf("step execution failed")
	}
	return err
}
