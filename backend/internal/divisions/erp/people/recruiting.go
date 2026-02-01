package people

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RecruitingService handles the applicant tracking lifecycle.
type RecruitingService struct {
	pool *pgxpool.Pool
}

// NewRecruitingService initializes the RecruitingService.
func NewRecruitingService(pool *pgxpool.Pool) *RecruitingService {
	return &RecruitingService{pool: pool}
}

// JobPosting represents a job opening.
type JobPosting struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

// Application represents a candidate's application.
type Application struct {
	ID           int    `json:"id"`
	CandidateID  int    `json:"candidate_id"`
	JobPostingID int    `json:"job_posting_id"`
	Status       string `json:"status"`
}

// CreateJobPosting creates a new job opening.
func (s *RecruitingService) CreateJobPosting(ctx context.Context, tenantID int, title, description string) (*JobPosting, error) {
	var id int
	err := s.pool.QueryRow(ctx, "INSERT INTO job_postings (tenant_id, title, description, status) VALUES ($1, $2, $3, 'draft') RETURNING id", tenantID, title, description).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &JobPosting{ID: id, Title: title, Description: description, Status: "draft"}, nil
}

// SubmitApplication processes a new candidate application.
func (s *RecruitingService) SubmitApplication(ctx context.Context, tenantID int, jobID int, firstName, lastName, email string) (*Application, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// 1. Find or create candidate
	var candID int
	err = tx.QueryRow(ctx, "SELECT id FROM candidates WHERE email = $1 AND tenant_id = $2", email, tenantID).Scan(&candID)

	if err == pgx.ErrNoRows {
		err = tx.QueryRow(ctx, "INSERT INTO candidates (tenant_id, first_name, last_name, email) VALUES ($1, $2, $3, $4) RETURNING id", tenantID, firstName, lastName, email).Scan(&candID)
		if err != nil {
			return nil, fmt.Errorf("failed to create candidate: %w", err)
		}
	} else if err != nil {
		return nil, err
	}

	// 2. Create application
	var appID int
	err = tx.QueryRow(ctx, "INSERT INTO applications (tenant_id, job_posting_id, candidate_id, status) VALUES ($1, $2, $3, 'new') RETURNING id", tenantID, jobID, candID).Scan(&appID)
	if err != nil {
		return nil, fmt.Errorf("failed to create application: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &Application{ID: appID, CandidateID: candID, JobPostingID: jobID, Status: "new"}, nil
}

// ScheduleInterview schedules a new interview for an application.
func (s *RecruitingService) ScheduleInterview(ctx context.Context, tenantID int, appID int, scheduledAt time.Time, interviewType string, interviewerIDs []int) (int, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	var itvID int
	err = tx.QueryRow(ctx, `
		INSERT INTO interviews (tenant_id, application_id, scheduled_at, type) 
		VALUES ($1, $2, $3, $4) RETURNING id`,
		tenantID, appID, scheduledAt, interviewType).Scan(&itvID)

	if err != nil {
		return 0, err
	}

	// In a real app, interviewer IDs would be in a join table
	for _, empID := range interviewerIDs {
		_, err = tx.Exec(ctx, "INSERT INTO interviewers (interview_id, employee_id) VALUES ($1, $2)", itvID, empID)
		if err != nil {
			return 0, err
		}
	}

	// Update application status
	_, err = tx.Exec(ctx, "UPDATE applications SET status = 'interviewing' WHERE id = $1", appID)
	if err != nil {
		return 0, err
	}

	return itvID, tx.Commit(ctx)
}
