package people

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/successionmap"
)

// SuccessionService handles org charts and succession planning.
type SuccessionService struct {
	db *ent.Client
}

// NewSuccessionService initializes the SuccessionService.
func NewSuccessionService(db *ent.Client) *SuccessionService {
	return &SuccessionService{db: db}
}

// TagHiPo marks an employee as High-Potential.
func (s *SuccessionService) TagHiPo(ctx context.Context, empID int, status bool) error {
	return s.db.Employee.UpdateOneID(empID).
		SetHipoStatus(status).
		Exec(ctx)
}

// AddBackupCandidate maps a backup candidate for an employee.
func (s *SuccessionService) AddBackupCandidate(ctx context.Context, empID, backupID int, level string) error {
	readiness := successionmap.ReadinessLevelREADY_2_YEAR // Default
	switch level {
	case "EMERGENCY":
		readiness = successionmap.ReadinessLevelEMERGENCY
	case "READY_1_YEAR":
		readiness = successionmap.ReadinessLevelREADY_1_YEAR
	}

	_, err := s.db.SuccessionMap.Create().
		SetEmployeeID(empID).
		SetBackupCandidateID(backupID).
		SetReadinessLevel(readiness).
		Save(ctx)
	
	return err
}

// GetSuccessionData retrieves all data for the succession planning visualization.
func (s *SuccessionService) GetSuccessionData(ctx context.Context) ([]map[string]interface{}, error) {
	emps, err := s.db.Employee.Query().
		WithManager().
		WithSuccessionPlans(func(q *ent.SuccessionMapQuery) {
			q.WithBackupCandidate()
		}).
		All(ctx)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, e := range emps {
		data := map[string]interface{}{
			"id":        e.ID,
			"name":      fmt.Sprintf("%s %s", e.FirstName, e.LastName),
			"role":      "Employee", // Role should be added to schema if needed
			"is_hipo":   e.HipoStatus,
			"backups":   []map[string]interface{}{},
		}
		
		if e.Edges.Manager != nil {
			data["manager_id"] = e.Edges.Manager.ID
		}

		for _, plan := range e.Edges.SuccessionPlans {
			backup := plan.Edges.BackupCandidate
			data["backups"] = append(data["backups"].([]map[string]interface{}), map[string]interface{}{
				"id":        backup.ID,
				"name":      fmt.Sprintf("%s %s", backup.FirstName, backup.LastName),
				"readiness": plan.ReadinessLevel,
			})
		}
		result = append(result, data)
	}

	return result, nil
}
