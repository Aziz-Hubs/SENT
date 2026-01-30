package people

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/employee"
	"sent/ent/tenant"
	"sent/ent/timeoffbalance"
	"sent/ent/timeoffrequest"
	"time"
)

// TimeOffManager handles time-off business logic
type TimeOffManager struct {
	client *ent.Client
}

// NewTimeOffManager creates a new TimeOffManager
func NewTimeOffManager(client *ent.Client) *TimeOffManager {
	return &TimeOffManager{client: client}
}

// RequestTimeOff creates a new time-off request
func (m *TimeOffManager) RequestTimeOff(ctx context.Context, tenantName string, employeeID int, requestType string, startDate, endDate time.Time, hours float64, notes string) (*ent.TimeOffRequest, error) {
	t, err := m.client.Tenant.Query().Where(tenant.Name(tenantName)).Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}

	emp, err := m.client.Employee.Get(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("employee not found: %w", err)
	}

	req, err := m.client.TimeOffRequest.Create().
		SetTenant(t).
		SetEmployee(emp).
		SetRequestType(timeoffrequest.RequestType(requestType)).
		SetStartDate(startDate).
		SetEndDate(endDate).
		SetRequestedHours(hours).
		SetStatus(timeoffrequest.StatusPENDING).
		SetNotes(notes).
		Save(ctx)

	return req, err
}

// ApproveRequest approves a time-off request
func (m *TimeOffManager) ApproveRequest(ctx context.Context, requestID, approverID int) error {
	req, err := m.client.TimeOffRequest.Get(ctx, requestID)
	if err != nil {
		return err
	}

	approver, err := m.client.Employee.Get(ctx, approverID)
	if err != nil {
		return err
	}

	_, err = req.Update().
		SetStatus(timeoffrequest.StatusAPPROVED).
		SetApprovedBy(approver).
		SetReviewedAt(time.Now()).
		Save(ctx)

	return err
}

// RejectRequest rejects a time-off request
func (m *TimeOffManager) RejectRequest(ctx context.Context, requestID, approverID int, reason string) error {
	req, err := m.client.TimeOffRequest.Get(ctx, requestID)
	if err != nil {
		return err
	}

	approver, err := m.client.Employee.Get(ctx, approverID)
	if err != nil {
		return err
	}

	_, err = req.Update().
		SetStatus(timeoffrequest.StatusREJECTED).
		SetApprovedBy(approver).
		SetReviewedAt(time.Now()).
		SetRejectionReason(reason).
		Save(ctx)

	return err
}

// GetEmployeeRequests returns all requests for an employee
func (m *TimeOffManager) GetEmployeeRequests(ctx context.Context, employeeID int) ([]*ent.TimeOffRequest, error) {
	return m.client.TimeOffRequest.Query().
		Where(timeoffrequest.HasEmployeeWith(employee.ID(employeeID))).
		WithEmployee().
		WithApprovedBy().
		Order(ent.Desc(timeoffrequest.FieldCreatedAt)).
		All(ctx)
}

// GetPendingApprovals returns pending requests for a manager
func (m *TimeOffManager) GetPendingApprovals(ctx context.Context, managerID int) ([]*ent.TimeOffRequest, error) {
	subordinates, err := m.client.Employee.Query().
		Where(employee.HasManagerWith(employee.ID(managerID))).
		IDs(ctx)
	if err != nil {
		return nil, err
	}

	return m.client.TimeOffRequest.Query().
		Where(
			timeoffrequest.HasEmployeeWith(employee.IDIn(subordinates...)),
			timeoffrequest.StatusEQ(timeoffrequest.StatusPENDING),
		).
		WithEmployee().
		Order(ent.Asc(timeoffrequest.FieldStartDate)).
		All(ctx)
}

// GetEmployeeBalance returns balance for an employee
func (m *TimeOffManager) GetEmployeeBalance(ctx context.Context, employeeID int, year int) ([]*ent.TimeOffBalance, error) {
	return m.client.TimeOffBalance.Query().
		Where(
			timeoffbalance.HasEmployeeWith(employee.ID(employeeID)),
			timeoffbalance.YearEQ(year),
		).
		WithPolicy().
		All(ctx)
}
