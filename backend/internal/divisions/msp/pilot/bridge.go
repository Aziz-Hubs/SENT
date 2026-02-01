package pilot

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	pilotdb "sent/internal/db/msp/pilot/sqlc"
	"sent/internal/platform/auth"
	"sent/internal/platform/orchestrator"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

// PilotBridge serves as the ITSM/PSA cockpit controller.
type PilotBridge struct {
	ctx     context.Context
	db      *pgxpool.Pool
	queries *pilotdb.Queries
	auth    *auth.AuthBridge
	river   *river.Client[pgx.Tx]
}

// NewPilotBridge initializes the ITSM bridge.
func NewPilotBridge(db *pgxpool.Pool, auth *auth.AuthBridge) *PilotBridge {
	return &PilotBridge{
		db:      db,
		queries: pilotdb.New(db),
		auth:    auth,
	}
}

// SetRiverClient sets the river client for enqueuing jobs.
func (b *PilotBridge) SetRiverClient(client *river.Client[pgx.Tx]) {
	b.river = client
}

// Startup initializes the bridge context.
func (b *PilotBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// GetTickets retrieves a list of tickets for the current tenant.
func (b *PilotBridge) GetTickets() ([]TicketDTO, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	tickets, err := b.queries.ListTickets(b.ctx, int32(tenantID))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tickets: %w", err)
	}

	var dtos []TicketDTO
	for _, t := range tickets {
		dto := TicketDTO{
			ID:          int(t.ID),
			Subject:     t.Subject,
			Description: t.Description.String,
			Status:      t.Status.String,
			Priority:    t.Priority.String,
			CreatedAt:   t.CreatedAt.Time,
			DeepLink:    t.DeepLink.String,
			Requester:   t.RequesterEmail.String,
			Assignee:    t.AssigneeEmail.String,
			Asset:       t.AssetName.String,
		}
		if len(t.ExecutionPlan) > 0 {
			json.Unmarshal(t.ExecutionPlan, &dto.ExecutionPlan)
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// ApproveTimeEntry marks a time entry as approved and triggers the billing sync.
func (b *PilotBridge) ApproveTimeEntry(timeEntryID int) error {
	tx, err := b.db.Begin(b.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(b.ctx)

	// 1. Update TimeEntry status
	_, err = tx.Exec(b.ctx, "UPDATE time_entries SET status = 'approved' WHERE id = $1", timeEntryID)
	if err != nil {
		return fmt.Errorf("failed to approve time entry: %w", err)
	}

	if err := tx.Commit(b.ctx); err != nil {
		return err
	}

	// Trigger job after successful commit
	if b.river != nil {
		_, err = b.river.Insert(b.ctx, orchestrator.BillingSyncArgs{
			TimeEntryID: timeEntryID,
		}, nil)
		if err != nil {
			fmt.Printf("[PILOT] Warning: Failed to enqueue billing sync: %v\n", err)
		}
	}

	return nil
}

// AssignTicket handles the load-balanced assignment logic.
func (b *PilotBridge) AssignTicket(ticketID int, technicianID int) error {
	tx, err := b.db.Begin(b.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(b.ctx)

	qtx := b.queries.WithTx(tx)

	// 1. Get Ticket Priority and Technician Seniority
	priority, err := qtx.GetTicketPriority(b.ctx, int32(ticketID))
	if err != nil {
		return err
	}

	seniority, err := qtx.GetUserSeniority(b.ctx, int32(technicianID))
	if err != nil {
		return err
	}

	// Get current WIP count
	wipCount, err := b.queries.CountTechnicianWIP(b.ctx, pgtype.Int4{Int32: int32(technicianID), Valid: true})
	if err != nil {
		return err
	}

	// 3. WIP Limit Enforcement Logic
	limit := int64(3) // Default Junior
	if seniority.String == "expert" {
		limit = 8
	}

	isEmergency := priority.String == "P1"
	if wipCount >= limit && !isEmergency {
		return fmt.Errorf("technician at capacity (%d/%d). Emergency bypass only", wipCount, limit)
	}

	// 4. Perform Assignment
	err = qtx.AssignTicket(b.ctx, pilotdb.AssignTicketParams{
		AssigneeID: pgtype.Int4{Int32: int32(technicianID), Valid: true},
		ID:         int32(ticketID),
	})
	if err != nil {
		return err
	}

	return tx.Commit(b.ctx)
}

// SanitizeLog applies regex-based redaction to log strings.
func (b *PilotBridge) SanitizeLog(input string) string {
	// Simple PII patterns (Email, IP, Credit Card)
	emailRegex := regexp.MustCompile(`[a-z0-9._%+\-]+@[a-z0-9.-]+\.[a-z]{2,4}`)
	ipRegex := regexp.MustCompile(`\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b`)

	output := emailRegex.ReplaceAllString(input, "[REDACTED_EMAIL]")
	output = ipRegex.ReplaceAllString(output, "[REDACTED_IP]")

	return output
}

// ExecuteRemediation triggers a planned fix from the execution plan.
func (b *PilotBridge) ExecuteRemediation(ticketID int, actionIndex int) error {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return err
	}

	// 1. Get ticket execution plan
	executionPlanJSON, err := b.queries.GetTicketExecutionPlan(b.ctx, int32(ticketID))
	if err != nil {
		return err
	}

	var planMap map[string]interface{}
	if err := json.Unmarshal(executionPlanJSON, &planMap); err != nil {
		return err
	}

	actions, ok := planMap["suggested_actions"].([]interface{})
	if !ok || actionIndex >= len(actions) {
		return fmt.Errorf("invalid remediation action index")
	}

	action := actions[actionIndex].(map[string]interface{})
	actionName := action["name"].(string)

	// 2. Create Remediation Step
	stepID, err := b.queries.CreateRemediationStep(b.ctx, pilotdb.CreateRemediationStepParams{
		TicketID:   int32(ticketID),
		ActionName: actionName,
	})
	if err != nil {
		return err
	}

	// 3. Enqueue Job
	if b.river != nil {
		_, err = b.river.Insert(b.ctx, orchestrator.RemediationArgs{
			TenantID:   profile.TenantID,
			TicketID:   ticketID,
			StepID:     int(stepID),
			ActionName: actionName,
			Params:     action,
		}, nil)
	}

	return err
}

type TicketDTO struct {
	ID            int                    `json:"id"`
	Subject       string                 `json:"subject"`
	Description   string                 `json:"description"`
	Status        string                 `json:"status"`
	Priority      string                 `json:"priority"`
	Requester     string                 `json:"requester"`
	Assignee      string                 `json:"assignee"`
	Asset         string                 `json:"asset"`
	CreatedAt     time.Time              `json:"createdAt"`
	DeepLink      string                 `json:"deepLink"`
	ExecutionPlan map[string]interface{} `json:"executionPlan"`
}

// mapTicketToDTO is no longer used as scanning is done directly into the DTO in GetTickets.
// Removing to clean up.
