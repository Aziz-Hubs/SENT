package agent

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"sent/pkg/pulse/common"
	_ "modernc.org/sqlite"
)

type LocalCache struct {
	db *sql.DB
}

func NewLocalCache(dbPath string) (*LocalCache, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite cache: %w", err)
	}

	// Create table for telemetry
	query := `
	CREATE TABLE IF NOT EXISTS telemetry (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`
	if _, err := db.Exec(query); err != nil {
		return nil, fmt.Errorf("failed to create cache table: %w", err)
	}

	return &LocalCache{db: db}, nil
}

func (c *LocalCache) SaveTelemetry(metrics *common.SystemMetrics) error {
	data, err := json.Marshal(metrics)
	if err != nil {
		return err
	}

	_, err = c.db.Exec("INSERT INTO telemetry (data) VALUES (?)", string(data))
	return err
}

func (c *LocalCache) GetPending(limit int) ([]*common.SystemMetrics, []int64, error) {
	rows, err := c.db.Query("SELECT id, data FROM telemetry ORDER BY id ASC LIMIT ?", limit)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var metrics []*common.SystemMetrics
	var ids []int64
	for rows.Next() {
		var id int64
		var dataStr string
		if err := rows.Scan(&id, &dataStr); err != nil {
			continue
		}
		var m common.SystemMetrics
		if err := json.Unmarshal([]byte(dataStr), &m); err != nil {
			continue
		}
		metrics = append(metrics, &m)
		ids = append(ids, id)
	}
	return metrics, ids, nil
}

func (c *LocalCache) DeleteTelemetry(ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	// Simple deletion for MVP
	for _, id := range ids {
		_, err := c.db.Exec("DELETE FROM telemetry WHERE id = ?", id)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *LocalCache) Close() error {
	return c.db.Close()
}
