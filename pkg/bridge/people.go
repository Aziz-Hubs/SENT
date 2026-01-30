package bridge

import (
	"context"
	"sent/ent"
	"sent/pkg/people"
	"time"
)

type PeopleBridge struct {
	ctx     context.Context
	db      *ent.Client
	timeoff *people.TimeOffManager
}

func NewPeopleBridge(db *ent.Client) *PeopleBridge {
	return &PeopleBridge{
		db:      db,
		timeoff: people.NewTimeOffManager(db),
	}
}

func (b *PeopleBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// --- Time Off DTOs ---

type TimeOffRequestDTO struct {
	ID             int     `json:"id"`
	EmployeeID     int     `json:"employee_id"`
	EmployeeName   string  `json:"employee_name"`
	RequestType    string  `json:"request_type"`
	StartDate      string  `json:"start_date"`
	EndDate        string  `json:"end_date"`
	RequestedHours float64 `json:"requested_hours"`
	Status         string  `json:"status"`
	Notes          string  `json:"notes"`
	CreatedAt      string  `json:"created_at"`
}

type TimeOffBalanceDTO struct {
	ID             int     `json:"id"`
	PolicyName     string  `json:"policy_name"`
	LeaveType      string  `json:"leave_type"`
	AvailableHours float64 `json:"available_hours"`
	UsedHours      float64 `json:"used_hours"`
	PendingHours   float64 `json:"pending_hours"`
	Year           int     `json:"year"`
}

// RequestTimeOff creates a new time-off request
func (b *PeopleBridge) RequestTimeOff(employeeID int, requestType string, startDateStr, endDateStr string, hours float64, notes string) (*TimeOffRequestDTO, error) {
	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	req, err := b.timeoff.RequestTimeOff(b.ctx, "Acuative Corporation", employeeID, requestType, startDate, endDate, hours, notes)
	if err != nil {
		return nil, err
	}

	return &TimeOffRequestDTO{
		ID:             req.ID,
		EmployeeID:     employeeID,
		RequestType:    string(req.RequestType),
		StartDate:      req.StartDate.Format("2006-01-02"),
		EndDate:        req.EndDate.Format("2006-01-02"),
		RequestedHours: req.RequestedHours,
		Status:         string(req.Status),
		Notes:          req.Notes,
		CreatedAt:      req.CreatedAt.Format(time.RFC3339),
	}, nil
}

// ApproveTimeOff approves a pending request
func (b *PeopleBridge) ApproveTimeOff(requestID, approverID int) error {
	return b.timeoff.ApproveRequest(b.ctx, requestID, approverID)
}

// RejectTimeOff rejects a pending request
func (b *PeopleBridge) RejectTimeOff(requestID, approverID int, reason string) error {
	return b.timeoff.RejectRequest(b.ctx, requestID, approverID, reason)
}

// GetMyTimeOffRequests returns requests for an employee
func (b *PeopleBridge) GetMyTimeOffRequests(employeeID int) ([]*TimeOffRequestDTO, error) {
	reqs, err := b.timeoff.GetEmployeeRequests(b.ctx, employeeID)
	if err != nil {
		return nil, err
	}

	var dtos []*TimeOffRequestDTO
	for _, r := range reqs {
		dto := &TimeOffRequestDTO{
			ID:             r.ID,
			RequestType:    string(r.RequestType),
			StartDate:      r.StartDate.Format("2006-01-02"),
			EndDate:        r.EndDate.Format("2006-01-02"),
			RequestedHours: r.RequestedHours,
			Status:         string(r.Status),
			Notes:          r.Notes,
			CreatedAt:      r.CreatedAt.Format(time.RFC3339),
		}
		if r.Edges.Employee != nil {
			dto.EmployeeID = r.Edges.Employee.ID
			dto.EmployeeName = r.Edges.Employee.FirstName + " " + r.Edges.Employee.LastName
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// GetPendingApprovals returns requests awaiting manager approval
func (b *PeopleBridge) GetPendingApprovals(managerID int) ([]*TimeOffRequestDTO, error) {
	reqs, err := b.timeoff.GetPendingApprovals(b.ctx, managerID)
	if err != nil {
		return nil, err
	}

	var dtos []*TimeOffRequestDTO
	for _, r := range reqs {
		dto := &TimeOffRequestDTO{
			ID:             r.ID,
			RequestType:    string(r.RequestType),
			StartDate:      r.StartDate.Format("2006-01-02"),
			EndDate:        r.EndDate.Format("2006-01-02"),
			RequestedHours: r.RequestedHours,
			Status:         string(r.Status),
			Notes:          r.Notes,
			CreatedAt:      r.CreatedAt.Format(time.RFC3339),
		}
		if r.Edges.Employee != nil {
			dto.EmployeeID = r.Edges.Employee.ID
			dto.EmployeeName = r.Edges.Employee.FirstName + " " + r.Edges.Employee.LastName
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// GetTimeOffBalance returns balances for an employee
func (b *PeopleBridge) GetTimeOffBalance(employeeID int) ([]*TimeOffBalanceDTO, error) {
	year := time.Now().Year()
	balances, err := b.timeoff.GetEmployeeBalance(b.ctx, employeeID, year)
	if err != nil {
		return nil, err
	}

	var dtos []*TimeOffBalanceDTO
	for _, bal := range balances {
		dto := &TimeOffBalanceDTO{
			ID:             bal.ID,
			AvailableHours: bal.AvailableHours,
			UsedHours:      bal.UsedHours,
			PendingHours:   bal.PendingHours,
			Year:           bal.Year,
		}
		if bal.Edges.Policy != nil {
			dto.PolicyName = bal.Edges.Policy.Name
			dto.LeaveType = string(bal.Edges.Policy.LeaveType)
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// --- Performance & Goals DTOs ---

type GoalDTO struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Status      string `json:"status"`
	Progress    int    `json:"progress"`
	TargetDate  string `json:"target_date"`
}

type ReviewDTO struct {
	ID            int    `json:"id"`
	CycleName     string `json:"cycle_name"`
	OverallRating string `json:"overall_rating"`
	Status        string `json:"status"`
	ReviewerName  string `json:"reviewer_name"`
	SubmittedAt   string `json:"submitted_at"`
}

// GetMyGoals returns goals for an employee
func (b *PeopleBridge) GetMyGoals(employeeID int) ([]*GoalDTO, error) {
	pm := people.NewPerformanceManager(b.db)
	goals, err := pm.GetEmployeeGoals(b.ctx, employeeID)
	if err != nil {
		return nil, err
	}

	var dtos []*GoalDTO
	for _, g := range goals {
		dto := &GoalDTO{
			ID:          g.ID,
			Title:       g.Title,
			Description: g.Description,
			Category:    string(g.Category),
			Status:      string(g.Status),
			Progress:    g.Progress,
		}
		if !g.TargetDate.IsZero() {
			dto.TargetDate = g.TargetDate.Format("2006-01-02")
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// CreateGoal creates a new goal
func (b *PeopleBridge) CreateGoal(employeeID int, title, description, category, targetDateStr string) (*GoalDTO, error) {
	pm := people.NewPerformanceManager(b.db)
	targetDate, _ := time.Parse("2006-01-02", targetDateStr)

	g, err := pm.CreateGoal(b.ctx, "Acuative Corporation", employeeID, title, description, category, targetDate)
	if err != nil {
		return nil, err
	}

	return &GoalDTO{
		ID:          g.ID,
		Title:       g.Title,
		Description: g.Description,
		Category:    string(g.Category),
		Status:      string(g.Status),
		Progress:    g.Progress,
		TargetDate:  g.TargetDate.Format("2006-01-02"),
	}, nil
}

// UpdateGoalProgress updates goal progress
func (b *PeopleBridge) UpdateGoalProgress(goalID, progress int, status string) error {
	pm := people.NewPerformanceManager(b.db)
	return pm.UpdateGoalProgress(b.ctx, goalID, progress, status)
}

// GetMyReviews returns reviews for an employee
func (b *PeopleBridge) GetMyReviews(employeeID int) ([]*ReviewDTO, error) {
	pm := people.NewPerformanceManager(b.db)
	reviews, err := pm.GetEmployeeReviews(b.ctx, employeeID)
	if err != nil {
		return nil, err
	}

	var dtos []*ReviewDTO
	for _, r := range reviews {
		dto := &ReviewDTO{
			ID:     r.ID,
			Status: string(r.Status),
		}
		if r.OverallRating != "" {
			dto.OverallRating = string(r.OverallRating)
		}
		if r.Edges.Cycle != nil {
			dto.CycleName = r.Edges.Cycle.Name
		}
		if r.Edges.Reviewer != nil {
			dto.ReviewerName = r.Edges.Reviewer.FirstName + " " + r.Edges.Reviewer.LastName
		}
		if !r.SubmittedAt.IsZero() {
			dto.SubmittedAt = r.SubmittedAt.Format("2006-01-02")
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

