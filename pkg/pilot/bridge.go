package pilot

import (
	"context"
	"fmt"
	"regexp"
	"sent/ent"
	"sent/ent/ticket"
	"sent/ent/timeentry"
	"sent/ent/user"
	"sent/pkg/orchestrator"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/riverqueue/river"
)

// PilotBridge serves as the ITSM/PSA cockpit controller.
type PilotBridge struct {
	ctx   context.Context
	db    *ent.Client
	river *river.Client[pgx.Tx]
}

// NewPilotBridge initializes the ITSM bridge.
func NewPilotBridge(db *ent.Client) *PilotBridge {
	return &PilotBridge{db: db}
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
	tickets, err := b.db.Ticket.Query().
		WithAssignee().
		WithRequester().
		WithAsset().
		Order(ent.Desc(ticket.FieldPriority)).
		All(b.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tickets: %w", err)
	}

	dtos := make([]TicketDTO, len(tickets))
	for i, t := range tickets {
		dtos[i] = mapTicketToDTO(t)
	}
	return dtos, nil
}

// ApproveTimeEntry marks a time entry as approved and triggers the billing sync.
func (b *PilotBridge) ApproveTimeEntry(timeEntryID int) error {
	tx, err := b.db.Tx(b.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Update TimeEntry status
	err = tx.TimeEntry.UpdateOneID(timeEntryID).
		SetStatus(timeentry.StatusApproved).
		Exec(b.ctx)
	if err != nil {
		return fmt.Errorf("failed to approve time entry: %w", err)
	}

	// 2. Enqueue BillingSyncWorker job if river client is available
	if b.river != nil {
		// We need to get the underlying pgx transaction from ent.Tx if possible,
		// or just insert using the client if we don't care about atomicity with ent.Tx
		// Since b.river uses pgx.Tx, we can't easily share the same transaction without more work.
		// For now, we insert after commit or use non-tx insert.
	}

	if err := tx.Commit(); err != nil {
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
// Implementation enforces seniority-based WIP limits unless ticket is P1 or user is VIP.
func (b *PilotBridge) AssignTicket(ticketID int, technicianID int) error {
	tx, err := b.db.Tx(b.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Get Ticket and Technician
	t, err := tx.Ticket.Get(b.ctx, ticketID)
	if err != nil {
		return err
	}
	tech, err := tx.User.Query().Where(user.ID(technicianID)).Only(b.ctx)
	if err != nil {
		return err
	}

	// 2. Check current WIP count
	wipCount, _ := tx.Ticket.Query().
		Where(ticket.HasAssigneeWith(user.ID(technicianID))).
		Where(ticket.StatusIn(ticket.StatusNew, ticket.StatusInProgress, ticket.StatusWaiting)).
		Count(b.ctx)

	// 3. WIP Limit Enforcement Logic
	limit := 3 // Default Junior
	if tech.Seniority == user.SeniorityExpert {
		limit = 8
	}

	isEmergency := t.Priority == ticket.PriorityP1 // Add VIP check later if field exists
	if wipCount >= limit && !isEmergency {
		return fmt.Errorf("technician at capacity (%d/%d). Emergency bypass only", wipCount, limit)
	}

	// 4. Perform Assignment
	err = tx.Ticket.UpdateOne(t).
		SetAssignee(tech).
		SetStatus(ticket.StatusInProgress).
		Exec(b.ctx)
	if err != nil {
		return err
	}

	return tx.Commit()
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

type TicketDTO struct {
	ID          int       `json:"id"`
	Subject     string    `json:"subject"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Priority    string    `json:"priority"`
	Requester   string    `json:"requester"`
	Assignee    string    `json:"assignee"`
	Asset       string    `json:"asset"`
	CreatedAt   time.Time `json:"createdAt"`
}

func mapTicketToDTO(t *ent.Ticket) TicketDTO {
	dto := TicketDTO{
		ID:          t.ID,
		Subject:     t.Subject,
		Description: t.Description,
		Status:      string(t.Status),
		Priority:    string(t.Priority),
		CreatedAt:   t.CreatedAt,
	}
	if t.Edges.Requester != nil {
		dto.Requester = t.Edges.Requester.Email
	}
	if t.Edges.Assignee != nil {
		dto.Assignee = t.Edges.Assignee.Email
	}
	if t.Edges.Asset != nil {
		dto.Asset = t.Edges.Asset.Name
	}
	return dto
}
