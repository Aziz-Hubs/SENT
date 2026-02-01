package pulse

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// JobManager handles job scheduling
type JobManager struct {
	pool *pgxpool.Pool
}

func NewJobManager(pool *pgxpool.Pool) *JobManager {
	return &JobManager{pool: pool}
}

// Job represents a scheduled task.
type Job struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	CronSchedule string    `json:"cron_schedule"`
	Targets      []string  `json:"targets"`
	NextRun      time.Time `json:"next_run"`
	ScriptID     int       `json:"script_id"`
}

// CreateJob creates a new job
func (m *JobManager) CreateJob(ctx context.Context, tenantName string, name string, scriptID int, targets []string, schedule string) (*Job, error) {
	if name == "" {
		return nil, fmt.Errorf("job name is required")
	}

	var tenantID int
	err := m.pool.QueryRow(ctx, "SELECT id FROM tenants WHERE name = $1", tenantName).Scan(&tenantID)
	if err != nil {
		// Fallback: Default to first tenant
		err = m.pool.QueryRow(ctx, "SELECT id FROM tenants LIMIT 1").Scan(&tenantID)
		if err != nil {
			return nil, fmt.Errorf("tenant failed: %w", err)
		}
	}

	var id int
	err = m.pool.QueryRow(ctx, `
		INSERT INTO jobs (tenant_id, name, script_id, targets, cron_schedule, next_run) 
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		tenantID, name, scriptID, targets, schedule, time.Now()).Scan(&id)

	if err != nil {
		return nil, err
	}

	return &Job{
		ID:           id,
		Name:         name,
		CronSchedule: schedule,
		Targets:      targets,
		NextRun:      time.Now(),
		ScriptID:     scriptID,
	}, nil
}

// ListJobs returns all jobs
func (m *JobManager) ListJobs(ctx context.Context, tenantName string) ([]Job, error) {
	rows, err := m.pool.Query(ctx, `
		SELECT id, name, cron_schedule, targets, next_run, script_id 
		FROM jobs 
		ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []Job
	for rows.Next() {
		var j Job
		if err := rows.Scan(&j.ID, &j.Name, &j.CronSchedule, &j.Targets, &j.NextRun, &j.ScriptID); err != nil {
			continue
		}
		jobs = append(jobs, j)
	}
	return jobs, nil
}
