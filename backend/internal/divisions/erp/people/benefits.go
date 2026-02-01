package people

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// BenefitsManager handles benefits administration logic.
type BenefitsManager struct {
	pool *pgxpool.Pool
}

// NewBenefitsManager creates a new BenefitsManager.
func NewBenefitsManager(pool *pgxpool.Pool) *BenefitsManager {
	return &BenefitsManager{pool: pool}
}

// BenefitPlan represents a plan record.
type BenefitPlan struct {
	ID                   int     `json:"id"`
	Name                 string  `json:"name"`
	Description          string  `json:"description"`
	Type                 string  `json:"type"`
	EmployerContribution float64 `json:"employer_contribution"`
	EmployeeDeduction    float64 `json:"employee_deduction"`
	Status               string  `json:"status"`
}

// BenefitEnrollment represents an employee's enrollment.
type BenefitEnrollment struct {
	ID            int          `json:"id"`
	EmployeeID    int          `json:"employee_id"`
	PlanID        int          `json:"plan_id"`
	Tier          string       `json:"tier"`
	EmployeeCost  float64      `json:"employee_cost"`
	EmployerCost  float64      `json:"employer_cost"`
	EffectiveFrom time.Time    `json:"effective_from"`
	Status        string       `json:"status"`
	Plan          *BenefitPlan `json:"plan,omitempty"`
}

// CreatePlan defines a new benefit plan options.
func (m *BenefitsManager) CreatePlan(ctx context.Context, tenantID int, name, description, planType string, empContrib, empDeduct float64) (*BenefitPlan, error) {
	var id int
	err := m.pool.QueryRow(ctx, `
		INSERT INTO benefit_plans (tenant_id, name, description, type, employer_contribution, employee_deduction, status) 
		VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING id`,
		tenantID, name, description, planType, empContrib, empDeduct).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &BenefitPlan{ID: id, Name: name, Description: description, Type: planType, EmployerContribution: empContrib, EmployeeDeduction: empDeduct, Status: "active"}, nil
}

// GetPlans returns all active plans for a tenant.
func (m *BenefitsManager) GetPlans(ctx context.Context, tenantID int) ([]BenefitPlan, error) {
	rows, err := m.pool.Query(ctx, `
		SELECT id, name, description, type, employer_contribution, employee_deduction, status 
		FROM benefit_plans 
		WHERE tenant_id = $1 AND status = 'active'`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []BenefitPlan
	for rows.Next() {
		var p BenefitPlan
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Type, &p.EmployerContribution, &p.EmployeeDeduction, &p.Status); err != nil {
			continue
		}
		plans = append(plans, p)
	}
	return plans, nil
}

// EnrollEmployee enrolls an employee in a plan.
func (m *BenefitsManager) EnrollEmployee(ctx context.Context, empID, planID int, tier string) (*BenefitEnrollment, error) {
	// 1. Get Plan details to calculate cost
	var plan BenefitPlan
	var tenantID int
	err := m.pool.QueryRow(ctx, `
		SELECT id, employee_deduction, employer_contribution, tenant_id 
		FROM benefit_plans 
		WHERE id = $1`, planID).Scan(&plan.ID, &plan.EmployeeDeduction, &plan.EmployerContribution, &tenantID)
	if err != nil {
		return nil, fmt.Errorf("plan not found: %w", err)
	}

	// 2. Calculate Tier Multipliers
	multiplier := 1.0
	switch tier {
	case "FAMILY":
		multiplier = 2.5
	case "COUPLE":
		multiplier = 1.8
	case "CHILDREN_ONLY":
		multiplier = 1.5
	}

	empCost := plan.EmployeeDeduction * multiplier
	empContrib := plan.EmployerContribution * multiplier

	// 3. Create Enrollment
	var enrollmentID int
	err = m.pool.QueryRow(ctx, `
		INSERT INTO benefit_enrollments (tenant_id, employee_id, benefit_plan_id, tier, employee_cost, employer_cost, effective_from, status) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING id`,
		tenantID, empID, planID, tier, empCost, empContrib, time.Now()).Scan(&enrollmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to create enrollment: %w", err)
	}

	return &BenefitEnrollment{
		ID:            enrollmentID,
		EmployeeID:    empID,
		PlanID:        planID,
		Tier:          tier,
		EmployeeCost:  empCost,
		EmployerCost:  empContrib,
		EffectiveFrom: time.Now(),
		Status:        "active",
	}, nil
}

// GetEmployeeEnrollments returns active enrollments for an employee.
func (m *BenefitsManager) GetEmployeeEnrollments(ctx context.Context, empID int) ([]BenefitEnrollment, error) {
	rows, err := m.pool.Query(ctx, `
		SELECT e.id, e.employee_id, e.benefit_plan_id, e.tier, e.employee_cost, e.employer_cost, e.effective_from, e.status,
		       p.name, p.type
		FROM benefit_enrollments e
		JOIN benefit_plans p ON e.benefit_plan_id = p.id
		WHERE e.employee_id = $1 AND e.status = 'active'`, empID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var enrollments []BenefitEnrollment
	for rows.Next() {
		var e BenefitEnrollment
		var pName, pType string
		err := rows.Scan(&e.ID, &e.EmployeeID, &e.PlanID, &e.Tier, &e.EmployeeCost, &e.EmployerCost, &e.EffectiveFrom, &e.Status, &pName, &pType)
		if err != nil {
			continue
		}
		e.Plan = &BenefitPlan{Name: pName, Type: pType}
		enrollments = append(enrollments, e)
	}
	return enrollments, nil
}

// CalculateTotalDeductions returns the total monthly deduction for an employee.
func (m *BenefitsManager) CalculateTotalDeductions(ctx context.Context, empID int) (float64, error) {
	enrollments, err := m.GetEmployeeEnrollments(ctx, empID)
	if err != nil {
		return 0, err
	}

	var total float64
	for _, e := range enrollments {
		total += e.EmployeeCost
	}
	return total, nil
}
