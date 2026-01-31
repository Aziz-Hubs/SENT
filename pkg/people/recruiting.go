package people

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/application"
	"sent/ent/candidate"
	"sent/ent/interview"
	"sent/ent/jobposting"
	"sent/ent/tenant"
)

// RecruitingService handles the applicant tracking lifecycle.
type RecruitingService struct {
	db *ent.Client
}

// NewRecruitingService initializes the RecruitingService.
func NewRecruitingService(db *ent.Client) *RecruitingService {
	return &RecruitingService{db: db}
}

// CreateJobPosting creates a new job opening.
func (s *RecruitingService) CreateJobPosting(ctx context.Context, tenantID int, title, description string) (*ent.JobPosting, error) {
	return s.db.JobPosting.Create().
		SetTenantID(tenantID).
		SetTitle(title).
		SetDescription(description).
		SetStatus(jobposting.StatusDRAFT).
		Save(ctx)
}

// SubmitApplication processes a new candidate application.
func (s *RecruitingService) SubmitApplication(ctx context.Context, tenantID int, jobID int, firstName, lastName, email string) (*ent.Application, error) {
	tx, err := s.db.Tx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Find or create candidate
	cand, err := tx.Candidate.Query().
		Where(candidate.Email(email), candidate.HasTenantWith(tenant.ID(tenantID))).
		Only(ctx)

	if ent.IsNotFound(err) {
		cand, err = tx.Candidate.Create().
			SetTenantID(tenantID).
			SetFirstName(firstName).
			SetLastName(lastName).
			SetEmail(email).
			Save(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to create candidate: %w", err)
		}
	} else if err != nil {
		return nil, err
	}

	// 2. Create application
	app, err := tx.Application.Create().
		SetTenantID(tenantID).
		SetJobPostingID(jobID).
		SetCandidate(cand).
		SetStatus(application.StatusNEW).
		Save(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to create application: %w", err)
	}

	return app, tx.Commit()
}

// ScheduleInterview schedules a new interview for an application.
func (s *RecruitingService) ScheduleInterview(ctx context.Context, tenantID int, appID int, scheduledAt time.Time, interviewType string, interviewerIDs []int) (*ent.Interview, error) {
	itv, err := s.db.Interview.Create().
		SetTenantID(tenantID).
		SetApplicationID(appID).
		SetScheduledAt(scheduledAt).
		SetType(interview.Type(interviewType)).
		AddInterviewerIDs(interviewerIDs...).
		Save(ctx)

	if err != nil {
		return nil, err
	}

	// Update application status
	err = s.db.Application.UpdateOneID(appID).
		SetStatus(application.StatusINTERVIEWING).
		Exec(ctx)

	return itv, err
}
