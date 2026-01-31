package people

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/employee"
	"sent/ent/performancereview"
	"sent/ent/reviewcycle"
	"sent/ent/tenant"
)

// RequestFeedback initiates 360-degree feedback requests.
func (m *PerformanceManager) RequestFeedback(ctx context.Context, tenantName string, requesterID int, peerIDs []int, cycleID *int) ([]*ent.PerformanceReview, error) {
	t, err := m.client.Tenant.Query().Where(tenant.Name(tenantName)).Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}

	requester, err := m.client.Employee.Get(ctx, requesterID)
	if err != nil {
		return nil, fmt.Errorf("requester not found: %w", err)
	}

	// If no cycle provided, find the active annual one
	if cycleID == nil {
		cycle, err := m.client.ReviewCycle.Query().
			Where(
				reviewcycle.HasTenantWith(tenant.ID(t.ID)),
				reviewcycle.StatusEQ(reviewcycle.StatusACTIVE),
			).
			First(ctx)
		if err != nil {
			return nil, fmt.Errorf("no active review cycle found: %w", err)
		}
		cycleID = &cycle.ID
	}

	var reviews []*ent.PerformanceReview

	// Create a peer review draft for each peer
	for _, peerID := range peerIDs {
		peer, err := m.client.Employee.Get(ctx, peerID)
		if err != nil {
			continue // Skip invalid peers
		}

		rv, err := m.client.PerformanceReview.Create().
			SetTenant(t).
			SetEmployee(requester). // The subject of the review
			SetReviewer(peer).      // The person giving feedback
			SetCycleID(*cycleID).
			SetStatus(performancereview.StatusPENDING).
			SetReviewType(performancereview.ReviewTypePEER).
			Save(ctx)

		if err != nil {
			return nil, fmt.Errorf("failed to create feedback request for peer %d: %w", peerID, err)
		}
		reviews = append(reviews, rv)
	}

	return reviews, nil
}

// GetIncomingFeedbackRequests returns peer reviews assigned to the user
func (m *PerformanceManager) GetIncomingFeedbackRequests(ctx context.Context, reviewerID int) ([]*ent.PerformanceReview, error) {
	return m.client.PerformanceReview.Query().
		Where(
			performancereview.HasReviewerWith(employee.ID(reviewerID)),
			performancereview.ReviewTypeEQ(performancereview.ReviewTypePEER),
			performancereview.StatusIn(performancereview.StatusPENDING, performancereview.StatusIN_PROGRESS),
		).
		WithEmployee(). // The person asking for feedback
		WithCycle().
		Order(ent.Desc(performancereview.FieldCreatedAt)).
		All(ctx)
}
