package pulse

import (
	"context"
	"fmt"
	"sent/ent"
    "sent/ent/script"
    "sent/ent/tenant"
    "time"
)

// JobManager handles job scheduling
type JobManager struct {
    client *ent.Client
}

func NewJobManager(client *ent.Client) *JobManager {
    return &JobManager{client: client}
}

// CreateJob creates a new job
func (m *JobManager) CreateJob(ctx context.Context, tenantID string, name string, scriptID int, targets []string, schedule string) (*ent.Job, error) {
    if name == "" {
        return nil, fmt.Errorf("job name is required")
    }

    t, err := m.client.Tenant.Query().Where(tenant.NameEQ(tenantID)).Only(ctx)
    if err != nil {
         // Fallback logic
        var tErr error
        t, tErr = m.client.Tenant.Query().Only(ctx)
        if tErr != nil {
             return nil, fmt.Errorf("tenant failed: %w", err)
        }
    }

    s, err := m.client.Script.Query().Where(script.IDEQ(scriptID)).Only(ctx)
    if err != nil {
        return nil, fmt.Errorf("script not found")
    }

    return m.client.Job.Create().
        SetTenant(t).
        SetName(name).
        SetScript(s).
        SetTargets(targets).
        SetCronSchedule(schedule).
        SetNextRun(time.Now()). // Immediate run if empty, or calculate based on cron
        Save(ctx)
}

// ListJobs returns all jobs
func (m *JobManager) ListJobs(ctx context.Context, tenantID string) ([]*ent.Job, error) {
     return m.client.Job.Query().
        WithScript().
        WithExecutions(func(q *ent.JobExecutionQuery) {
            q.Order(ent.Desc("created_at")).Limit(5) // Get recent executions
        }).
        All(ctx)
}
