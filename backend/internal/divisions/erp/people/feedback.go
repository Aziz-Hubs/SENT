package people

import (
	"context"
	"fmt"
	"time"

	peopledb "sent/internal/db/erp/people/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

// RequestFeedback initiates 360-degree feedback requests.
func (m *PerformanceManager) RequestFeedback(ctx context.Context, tenantName string, requesterID int, peerIDs []int, cycleID *int) ([]peopledb.PerformanceReview, error) {
	var tenantID int32
	err := m.pool.QueryRow(ctx, "SELECT id FROM tenants WHERE name = $1", tenantName).Scan(&tenantID)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}

	// If no cycle provided, find the active annual one
	var finalCycleID int32
	if cycleID == nil {
		cID, err := m.queries.GetActiveReviewCycle(ctx, tenantID)
		if err != nil {
			return nil, fmt.Errorf("no active review cycle found: %w", err)
		}
		finalCycleID = cID
	} else {
		finalCycleID = int32(*cycleID)
	}

	var reviews []peopledb.PerformanceReview

	// Create a peer review draft for each peer
	for _, peerID := range peerIDs {
		id, err := m.queries.CreatePerformanceReview(ctx, peopledb.CreatePerformanceReviewParams{
			TenantID:   tenantID,
			EmployeeID: int32(requesterID),
			ReviewerID: pgtype.Int4{Int32: int32(peerID), Valid: true},
			CycleID:    pgtype.Int4{Int32: finalCycleID, Valid: true},
			Status:     pgtype.Text{String: "pending", Valid: true},
			ReviewType: pgtype.Text{String: "peer", Valid: true},
		})

		if err != nil {
			return nil, fmt.Errorf("failed to create feedback request for peer %d: %w", peerID, err)
		}

		reviews = append(reviews, peopledb.PerformanceReview{
			ID:         id,
			TenantID:   tenantID,
			EmployeeID: int32(requesterID),
			ReviewerID: pgtype.Int4{Int32: int32(peerID), Valid: true},
			CycleID:    pgtype.Int4{Int32: finalCycleID, Valid: true},
			Status:     pgtype.Text{String: "pending", Valid: true},
			ReviewType: pgtype.Text{String: "peer", Valid: true},
			CreatedAt:  pgtype.Timestamptz{Time: time.Now(), Valid: true},
		})
	}

	return reviews, nil
}

// GetIncomingFeedbackRequests returns peer reviews assigned to the user
func (m *PerformanceManager) GetIncomingFeedbackRequests(ctx context.Context, reviewerID int) ([]peopledb.GetIncomingFeedbackRequestsRow, error) {
	return m.queries.GetIncomingFeedbackRequests(ctx, pgtype.Int4{Int32: int32(reviewerID), Valid: true})
}
