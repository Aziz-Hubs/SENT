package pilot

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/contract"
	"sent/ent/tenant"
)

// BillingService handles the precision block-hour deductions.
type BillingService struct {
	db *ent.Client
}

// LogTime adds a time entry and deducts from the contract block.
func (s *BillingService) LogTime(ctx context.Context, ticketID int, technicianID int, hours float64) error {
	tx, err := s.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Get Tenant Contract
	// Assuming 1 active contract per tenant for now
	cnt, err := tx.Contract.Query().
		Where(contract.HasTenantWith(tenant.ID(1))). // TODO: Map to actual tenant
		Where(contract.IsActive(true)).
		Only(ctx)
	
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
	err = tx.Contract.UpdateOne(cnt).
		SetRemainingHours(newBalance).
		Exec(ctx)
	if err != nil {
		return err
	}

	// 4. Create Time Entry
	_, err = tx.TimeEntry.Create().
		SetTicketID(ticketID).
		SetTechnicianID(technicianID).
		SetDurationHours(hours).
		SetStartedAt(cnt.StartDate). // Mock
		Save(ctx)
	if err != nil {
		return err
	}

	// 5. Trigger Refill alert if negative
	if newBalance < 0 {
		fmt.Printf("[PILOT] Critical Refill Event Triggered for Contract %d\n", cnt.ID)
	}

	return tx.Commit()
}
