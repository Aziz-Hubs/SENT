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
	SubjectName   string `json:"subject_name,omitempty"` // For peer reviews
	Type          string `json:"type"`
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
			Type:   string(r.ReviewType),
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
		if r.Edges.Employee != nil {
			dto.SubjectName = r.Edges.Employee.FirstName + " " + r.Edges.Employee.LastName
		}
		if !r.SubmittedAt.IsZero() {
			dto.SubmittedAt = r.SubmittedAt.Format("2006-01-02")
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// RequestPeerFeedback initiates a 360 review request
func (b *PeopleBridge) RequestPeerFeedback(requesterID int, peerIDs []int) error {
	pm := people.NewPerformanceManager(b.db)
	_, err := pm.RequestFeedback(b.ctx, "Acuative Corporation", requesterID, peerIDs, nil)
	return err
}

// GetFeedbackRequests returns reviews where the user is the reviewer (Peer Reviews)
func (b *PeopleBridge) GetFeedbackRequests(reviewerID int) ([]*ReviewDTO, error) {
	pm := people.NewPerformanceManager(b.db)
	reqs, err := pm.GetIncomingFeedbackRequests(b.ctx, reviewerID)
	if err != nil {
		return nil, err
	}

	var dtos []*ReviewDTO
	for _, r := range reqs {
		dto := &ReviewDTO{
			ID:     r.ID,
			Status: string(r.Status),
			Type:   string(r.ReviewType),
		}
		if r.Edges.Cycle != nil {
			dto.CycleName = r.Edges.Cycle.Name
		}
		// In a feedback request, the "Subject" is the person we are reviewing (r.Edges.Employee)
		if r.Edges.Employee != nil {
			dto.SubjectName = r.Edges.Employee.FirstName + " " + r.Edges.Employee.LastName
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// --- Benefits DTOs ---

type BenefitPlanDTO struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	Type         string  `json:"type"`
	Description  string  `json:"description"`
	EmpCost      float64 `json:"employee_cost"`
	EmployerCost float64 `json:"employer_cost"`
}

type BenefitEnrollmentDTO struct {
	ID        int     `json:"id"`
	PlanName  string  `json:"plan_name"`
	PlanType  string  `json:"plan_type"`
	Tier      string  `json:"tier"`
	MyCost    float64 `json:"my_cost"`
	Status    string  `json:"status"`
	Effective string  `json:"effective_date"`
}

// --- Recruiting & ATS DTOs ---

type JobPostingDTO struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

type ApplicationDTO struct {
	ID            int    `json:"id"`
	CandidateName string `json:"candidate_name"`
	CandidateEmail string `json:"candidate_email"`
	Status        string `json:"status"`
	AppliedAt     string `json:"applied_at"`
}

// --- Benefits Methods ---

func (b *PeopleBridge) GetBenefitPlans() ([]*BenefitPlanDTO, error) {
	bm := people.NewBenefitsManager(b.db)
	// Hardcoded tenant ID 1 for now
	plans, err := bm.GetPlans(b.ctx, 1)
	if err != nil {
		return nil, err
	}

	var dtos []*BenefitPlanDTO
	for _, p := range plans {
		dtos = append(dtos, &BenefitPlanDTO{
			ID:           p.ID,
			Name:         p.Name,
			Type:         string(p.Type),
			Description:  p.Description,
			EmpCost:      p.EmployeeDeduction,
			EmployerCost: p.EmployerContribution,
		})
	}
	return dtos, nil
}

func (b *PeopleBridge) EnrollInBenefit(empID int, planID int, tier string) error {
	bm := people.NewBenefitsManager(b.db)
	_, err := bm.EnrollEmployee(b.ctx, empID, planID, tier)
	return err
}

func (b *PeopleBridge) GetMyBenefits(empID int) ([]*BenefitEnrollmentDTO, error) {
	bm := people.NewBenefitsManager(b.db)
	enrollments, err := bm.GetEmployeeEnrollments(b.ctx, empID)
	if err != nil {
		return nil, err
	}

	var dtos []*BenefitEnrollmentDTO
	for _, e := range enrollments {
		dto := &BenefitEnrollmentDTO{
			ID:        e.ID,
			Tier:      string(e.Tier),
			MyCost:    e.EmployeeCost,
			Status:    string(e.Status),
			Effective: e.EffectiveFrom.Format("2006-01-02"),
		}
		if e.Edges.Plan != nil {
			dto.PlanName = e.Edges.Plan.Name
			dto.PlanType = string(e.Edges.Plan.Type)
		}
		dtos = append(dtos, dto)
	}
	return dtos, nil
}

// CreateJobPosting creates a new job opening
func (b *PeopleBridge) CreateJobPosting(tenantID int, title, description string) (*JobPostingDTO, error) {
	rs := people.NewRecruitingService(b.db)
	job, err := rs.CreateJobPosting(b.ctx, tenantID, title, description)
	if err != nil {
		return nil, err
	}

	return &JobPostingDTO{
		ID:          job.ID,
		Title:       job.Title,
		Description: job.Description,
		Status:      string(job.Status),
		CreatedAt:   job.CreatedAt.Format(time.RFC3339),
	}, nil
}

// SubmitApplication submits a new application
func (b *PeopleBridge) SubmitApplication(tenantID, jobID int, firstName, lastName, email string) (*ApplicationDTO, error) {
	rs := people.NewRecruitingService(b.db)
	app, err := rs.SubmitApplication(b.ctx, tenantID, jobID, firstName, lastName, email)
	if err != nil {
		return nil, err
	}

	// Load candidate for DTO
	cand, _ := app.QueryCandidate().Only(b.ctx)

	return &ApplicationDTO{
		ID:            app.ID,
		CandidateName:  cand.FirstName + " " + cand.LastName,
		CandidateEmail: cand.Email,
		Status:        string(app.Status),
		AppliedAt:     app.AppliedAt.Format(time.RFC3339),
	}, nil
}

// GetJobPostings returns all job postings for a tenant
func (b *PeopleBridge) GetJobPostings(tenantID int) ([]*JobPostingDTO, error) {
	jobs, err := b.db.JobPosting.Query().All(b.ctx)
	if err != nil {
		return nil, err
	}

	var dtos []*JobPostingDTO
	for _, j := range jobs {
		dtos = append(dtos, &JobPostingDTO{
			ID:          j.ID,
			Title:       j.Title,
			Description: j.Description,
			Status:      string(j.Status),
			CreatedAt:   j.CreatedAt.Format(time.RFC3339),
		})
	}
	return dtos, nil
}
