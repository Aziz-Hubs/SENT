package pilot

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// BillingService handles the precision block-hour deductions.
type BillingService struct {
	pool *pgxpool.Pool
}

// NewBillingService initializes the BillingService.
func NewBillingService(pool *pgxpool.Pool) *BillingService {
	return &BillingService{pool: pool}
}

// LogTime adds a time entry and deducts from the contract block.
func (s *BillingService) LogTime(ctx context.Context, ticketID int, technicianID int, hours float64) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Get Tenant Contract
	// Assuming 1 active contract per tenant for now (Tenant ID 1 as placeholder)
	var cnt struct {
		ID                    int
		RemainingHours        float64
		TotalHours            float64
		GraceThresholdPercent float64
	}

	err = tx.QueryRow(ctx, `
		SELECT id, remaining_hours, total_hours, grace_threshold_percent 
		FROM contracts 
		WHERE tenant_id = 1 AND is_active = true 
		LIMIT 1`).Scan(&cnt.ID, &cnt.RemainingHours, &cnt.TotalHours, &cnt.GraceThresholdPercent)

	if err != nil {
		return fmt.Errorf("active contract not found: %w", err)
	}

	// 2. Deduction with Grace Management
	newBalance := cnt.RemainingHours - hours
	graceAmount := (cnt.GraceThresholdPercent / 100.0) * cnt.TotalHours

	// If balance goes negative beyond grace, reject
	if newBalance < -graceAmount {
		return fmt.Errorf("contract exhausted. Balance: %.2f, Grace: %.2f. Refill required", newBalance, graceAmount)
	}

	// 3. Update Contract
	_, err = tx.Exec(ctx, "UPDATE contracts SET remaining_hours = $1 WHERE id = $2", newBalance, cnt.ID)
	if err != nil {
		return err
	}

	// 4. Create Time Entry
	_, err = tx.Exec(ctx, `
		INSERT INTO time_entries (ticket_id, technician_id, duration_hours, start_time, status) 
		VALUES ($1, $2, $3, $4, 'approved')`,
		ticketID, technicianID, hours, time.Now())
	if err != nil {
		return err
	}

	// 5. Trigger Refill alert if negative
	if newBalance < 0 {
		fmt.Printf("[PILOT] Critical Refill Event Triggered for Contract %d\n", cnt.ID)
	}

	return tx.Commit(ctx)
}
