package people

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SuccessionService handles org charts and succession planning.
type SuccessionService struct {
	pool *pgxpool.Pool
}

// NewSuccessionService initializes the SuccessionService.
func NewSuccessionService(pool *pgxpool.Pool) *SuccessionService {
	return &SuccessionService{pool: pool}
}

// TagHiPo marks an employee as High-Potential.
func (s *SuccessionService) TagHiPo(ctx context.Context, empID int, status bool) error {
	_, err := s.pool.Exec(ctx, "UPDATE employees SET hipo_status = $1 WHERE id = $2", status, empID)
	return err
}

// AddBackupCandidate maps a backup candidate for an employee.
func (s *SuccessionService) AddBackupCandidate(ctx context.Context, empID, backupID int, level string) error {
	readiness := "READY_2_YEAR" // Default
	switch level {
	case "EMERGENCY":
		readiness = "EMERGENCY"
	case "READY_1_YEAR":
		readiness = "READY_1_YEAR"
	}

	_, err := s.pool.Exec(ctx, `
		INSERT INTO succession_maps (employee_id, backup_candidate_id, readiness_level) 
		VALUES ($1, $2, $3)`,
		empID, backupID, readiness)

	return err
}

// GetSuccessionData retrieves all data for the succession planning visualization.
func (s *SuccessionService) GetSuccessionData(ctx context.Context) ([]map[string]interface{}, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT e.id, e.first_name, e.last_name, e.hipo_status, e.manager_id,
		       COALESCE(
		           (SELECT json_agg(json_build_object(
		               'id', b.id,
		               'name', b.first_name || ' ' || b.last_name,
		               'readiness', sm.readiness_level
		           )) FROM succession_maps sm
		           JOIN employees b ON sm.backup_candidate_id = b.id
		           WHERE sm.employee_id = e.id),
		           '[]'::json
		       ) as backups
		FROM employees e`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var id int
		var first, last string
		var hipo bool
		var managerID *int
		var backupsRaw interface{}

		err := rows.Scan(&id, &first, &last, &hipo, &managerID, &backupsRaw)
		if err != nil {
			continue
		}

		data := map[string]interface{}{
			"id":      id,
			"name":    fmt.Sprintf("%s %s", first, last),
			"role":    "Employee",
			"is_hipo": hipo,
			"backups": backupsRaw,
		}

		if managerID != nil {
			data["manager_id"] = *managerID
		}

		result = append(result, data)
	}

	return result, nil
}
