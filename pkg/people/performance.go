package people

import (
	"context"
	"sent/ent"
	"sent/ent/employee"
	"sent/ent/goal"
	"sent/ent/performancereview"
	"sent/ent/reviewcycle"
	"sent/ent/tenant"
	"time"
)

// PerformanceManager handles performance review logic
type PerformanceManager struct {
	client *ent.Client
}

// NewPerformanceManager creates a new PerformanceManager
func NewPerformanceManager(client *ent.Client) *PerformanceManager {
	return &PerformanceManager{client: client}
}

// GetActiveCycles returns active review cycles for a tenant
func (m *PerformanceManager) GetActiveCycles(ctx context.Context, tenantName string) ([]*ent.ReviewCycle, error) {
	return m.client.ReviewCycle.Query().
		Where(
			reviewcycle.HasTenantWith(tenant.Name(tenantName)),
			reviewcycle.StatusEQ(reviewcycle.StatusACTIVE),
		).
		Order(ent.Desc(reviewcycle.FieldStartDate)).
		All(ctx)
}

// GetEmployeeReviews returns reviews for an employee
func (m *PerformanceManager) GetEmployeeReviews(ctx context.Context, employeeID int) ([]*ent.PerformanceReview, error) {
	return m.client.PerformanceReview.Query().
		Where(performancereview.HasEmployeeWith(employee.ID(employeeID))).
		WithCycle().
		WithReviewer().
		Order(ent.Desc(performancereview.FieldCreatedAt)).
		All(ctx)
}

// GetPendingReviews returns reviews awaiting manager action
func (m *PerformanceManager) GetPendingReviews(ctx context.Context, reviewerID int) ([]*ent.PerformanceReview, error) {
	return m.client.PerformanceReview.Query().
		Where(
			performancereview.HasReviewerWith(employee.ID(reviewerID)),
			performancereview.StatusIn(performancereview.StatusPENDING, performancereview.StatusIN_PROGRESS),
		).
		WithEmployee().
		WithCycle().
		Order(ent.Asc(performancereview.FieldCreatedAt)).
		All(ctx)
}

// SubmitReview submits a completed review
func (m *PerformanceManager) SubmitReview(ctx context.Context, reviewID int, rating string, strengths, improvements, comments string) error {
	_, err := m.client.PerformanceReview.UpdateOneID(reviewID).
		SetOverallRating(performancereview.OverallRating(rating)).
		SetStrengths(strengths).
		SetAreasForImprovement(improvements).
		SetManagerComments(comments).
		SetStatus(performancereview.StatusSUBMITTED).
		SetSubmittedAt(time.Now()).
		Save(ctx)
	return err
}

// AcknowledgeReview marks a review as acknowledged by employee
func (m *PerformanceManager) AcknowledgeReview(ctx context.Context, reviewID int) error {
	_, err := m.client.PerformanceReview.UpdateOneID(reviewID).
		SetStatus(performancereview.StatusACKNOWLEDGED).
		SetAcknowledgedAt(time.Now()).
		Save(ctx)
	return err
}

// --- Goals ---

// GetEmployeeGoals returns goals for an employee
func (m *PerformanceManager) GetEmployeeGoals(ctx context.Context, employeeID int) ([]*ent.Goal, error) {
	return m.client.Goal.Query().
		Where(goal.HasEmployeeWith(employee.ID(employeeID))).
		Order(ent.Asc(goal.FieldTargetDate)).
		All(ctx)
}

// CreateGoal creates a new goal
func (m *PerformanceManager) CreateGoal(ctx context.Context, tenantName string, employeeID int, title, description, category string, targetDate time.Time) (*ent.Goal, error) {
	t, err := m.client.Tenant.Query().Where(tenant.Name(tenantName)).Only(ctx)
	if err != nil {
		return nil, err
	}

	emp, err := m.client.Employee.Get(ctx, employeeID)
	if err != nil {
		return nil, err
	}

	return m.client.Goal.Create().
		SetTenant(t).
		SetEmployee(emp).
		SetTitle(title).
		SetDescription(description).
		SetCategory(goal.Category(category)).
		SetTargetDate(targetDate).
		SetStatus(goal.StatusNOT_STARTED).
		SetProgress(0).
		Save(ctx)
}

// UpdateGoalProgress updates goal progress
func (m *PerformanceManager) UpdateGoalProgress(ctx context.Context, goalID int, progress int, status string) error {
	update := m.client.Goal.UpdateOneID(goalID).
		SetProgress(progress).
		SetStatus(goal.Status(status))

	if status == "COMPLETED" {
		update.SetCompletedAt(time.Now())
	}

	_, err := update.Save(ctx)
	return err
}
