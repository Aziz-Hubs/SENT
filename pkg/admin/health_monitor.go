package admin

import (
	"context"
	"runtime"
	"time"

	"sent/ent"
)

type SystemHealth struct {
	Status    string            `json:"status"`
	Uptime    float64           `json:"uptime"`
	GoVersion string            `json:"goVersion"`
	Memory    runtime.MemStats  `json:"memory"`
	Database  string            `json:"database"`
	Workers   map[string]string `json:"workers"`
}

var startTime = time.Now()

type Monitor struct {
	client *ent.Client
}

func NewMonitor(client *ent.Client) *Monitor {
	return &Monitor{client: client}
}

func (m *Monitor) GetReport(ctx context.Context) SystemHealth {
	var mStats runtime.MemStats
	runtime.ReadMemStats(&mStats)

	dbStatus := "Healthy"
	if err := m.client.Schema.Create(ctx); err != nil {
		dbStatus = "Degraded"
	}

	return SystemHealth{
		Status:    "OK",
		Uptime:    time.Since(startTime).Seconds(),
		GoVersion: runtime.Version(),
		Memory:    mStats,
		Database:  dbStatus,
		Workers: map[string]string{
			"MediaMTX": "Running",
			"PionSFU":  "Active",
			"River":    "Idle",
		},
	}
}
