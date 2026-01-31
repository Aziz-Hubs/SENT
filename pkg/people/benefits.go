package people

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/benefitenrollment"
	"sent/ent/benefitplan"
	"sent/ent/employee"
	"sent/ent/tenant"
)

// BenefitsManager handles benefits administration logic.
type BenefitsManager struct {
	client *ent.Client
}

// NewBenefitsManager creates a new BenefitsManager.
func NewBenefitsManager(client *ent.Client) *BenefitsManager {
	return &BenefitsManager{client: client}
}

// CreatePlan defines a new benefit plan options.
func (m *BenefitsManager) CreatePlan(ctx context.Context, tenantID int, name, description, planType string, empContrib, empDeduct float64) (*ent.BenefitPlan, error) {
	return m.client.BenefitPlan.Create().
		SetTenantID(tenantID).
		SetName(name).
		SetDescription(description).
		SetType(benefitplan.Type(planType)).
		SetEmployerContribution(empContrib).
		SetEmployeeDeduction(empDeduct).
		SetStatus(benefitplan.StatusACTIVE).
		Save(ctx)
}

// GetPlans returns all active plans for a tenant.
func (m *BenefitsManager) GetPlans(ctx context.Context, tenantID int) ([]*ent.BenefitPlan, error) {
	return m.client.BenefitPlan.Query().
		Where(
			benefitplan.HasTenantWith(tenant.ID(tenantID)),
			benefitplan.StatusEQ(benefitplan.StatusACTIVE),
		).
		All(ctx)
}

// EnrollEmployee enrolls an employee in a plan.
func (m *BenefitsManager) EnrollEmployee(ctx context.Context, empID, planID int, tier string) (*ent.BenefitEnrollment, error) {
	// 1. Get Plan details to calculate cost
	plan, err := m.client.BenefitPlan.Query().
		Where(benefitplan.ID(planID)).
		WithTenant().
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("plan not found: %w", err)
	}

	// 2. Calculate Tier Multipliers (Simple logic for now)
	multiplier := 1.0
	switch tier {
	case "FAMILY":
		multiplier = 2.5
	case "COUPLE":
		multiplier = 1.8
	case "CHILDREN_ONLY":
		multiplier = 1.5
	}

	// 3. Create Enrollment
	return m.client.BenefitEnrollment.Create().
		SetTenantID(plan.Edges.Tenant.ID). // Inherit tenant from plan
		SetEmployeeID(empID).
		SetPlan(plan).
		SetTier(benefitenrollment.Tier(tier)).
		SetEmployeeCost(plan.EmployeeDeduction * multiplier).
		SetEmployerCost(plan.EmployerContribution * multiplier).
		SetEffectiveFrom(time.Now()).
		SetStatus(benefitenrollment.StatusACTIVE).
		Save(ctx)
}

// GetEmployeeEnrollments returns active enrollments for an employee.
func (m *BenefitsManager) GetEmployeeEnrollments(ctx context.Context, empID int) ([]*ent.BenefitEnrollment, error) {
	return m.client.BenefitEnrollment.Query().
		Where(
			benefitenrollment.HasEmployeeWith(employee.ID(empID)),
			benefitenrollment.StatusEQ(benefitenrollment.StatusACTIVE),
		).
		WithPlan().
		All(ctx)
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
