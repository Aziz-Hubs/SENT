package people

import (
	"context"
	"fmt"
	"time"

	peopledb "sent/internal/db/erp/people/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PerformanceManager handles performance review logic
type PerformanceManager struct {
	pool    *pgxpool.Pool
	queries *peopledb.Queries
}

// NewPerformanceManager creates a new PerformanceManager
func NewPerformanceManager(pool *pgxpool.Pool) *PerformanceManager {
	return &PerformanceManager{
		pool:    pool,
		queries: peopledb.New(pool),
	}
}

// PerformanceReview represents a review record

// GetEmployeeReviews returns reviews for an employee
func (m *PerformanceManager) GetEmployeeReviews(ctx context.Context, employeeID int) ([]peopledb.GetEmployeeReviewsRow, error) {
	return m.queries.GetEmployeeReviews(ctx, int32(employeeID))
}

// SubmitReview submits a completed review
// SubmitReview submits a completed review
func (m *PerformanceManager) SubmitReview(ctx context.Context, reviewID int, rating string, strengths, improvements, comments string) error {
	return m.queries.SubmitReview(ctx, peopledb.SubmitReviewParams{
		OverallRating:       pgtype.Text{String: rating, Valid: true},
		Strengths:           pgtype.Text{String: strengths, Valid: true},
		AreasForImprovement: pgtype.Text{String: improvements, Valid: true},
		ManagerComments:     pgtype.Text{String: comments, Valid: true},
		SubmittedAt:         pgtype.Timestamptz{Time: time.Now(), Valid: true},
		ID:                  int32(reviewID),
	})
}

// AcknowledgeReview marks a review as acknowledged by employee
func (m *PerformanceManager) AcknowledgeReview(ctx context.Context, reviewID int) error {
	return m.queries.AcknowledgeReview(ctx, peopledb.AcknowledgeReviewParams{
		ID:             int32(reviewID),
		AcknowledgedAt: pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
}

// GetEmployeeGoals returns goals for an employee
func (m *PerformanceManager) GetEmployeeGoals(ctx context.Context, employeeID int) ([]peopledb.Goal, error) {
	return m.queries.GetEmployeeGoals(ctx, int32(employeeID))
}

// CreateGoal creates a new goal
func (m *PerformanceManager) CreateGoal(ctx context.Context, tenantName string, employeeID int, title, description, category string, targetDate time.Time) (*peopledb.Goal, error) {
	var tenantID int32
	err := m.pool.QueryRow(ctx, "SELECT id FROM tenants WHERE name = $1", tenantName).Scan(&tenantID)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}

	id, err := m.queries.CreateGoal(ctx, peopledb.CreateGoalParams{
		TenantID:    tenantID,
		EmployeeID:  int32(employeeID),
		Title:       title,
		Description: pgtype.Text{String: description, Valid: true},
		Category:    pgtype.Text{String: category, Valid: true},
		TargetDate:  pgtype.Timestamptz{Time: targetDate, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	return &peopledb.Goal{
		ID:          id,
		TenantID:    tenantID, // Assuming TenantID is in Goal struct
		EmployeeID:  int32(employeeID),
		Title:       title,
		Description: pgtype.Text{String: description, Valid: true},
		Category:    pgtype.Text{String: category, Valid: true},
		Status:      pgtype.Text{String: "NOT_STARTED", Valid: true}, // Check if this matches DB default or what strict expects
		Progress:    pgtype.Int4{Int32: 0, Valid: true},
		TargetDate:  pgtype.Timestamptz{Time: targetDate, Valid: true},
		CreatedAt:   pgtype.Timestamptz{Time: time.Now(), Valid: true},
	}, nil
}

// UpdateGoalProgress updates goal progress
func (m *PerformanceManager) UpdateGoalProgress(ctx context.Context, goalID int, progress int, status string) error {
	return m.queries.UpdateGoalProgress(ctx, peopledb.UpdateGoalProgressParams{
		Progress: pgtype.Int4{Int32: int32(progress), Valid: true},
		Status:   pgtype.Text{String: status, Valid: true},
		ID:       int32(goalID),
	})
}
