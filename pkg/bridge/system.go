package bridge

import (
	"context"
	"os"
	"time"
)

// SystemBridge handles system-level operations and monitoring.
type SystemBridge struct {
	ctx       context.Context
	startTime time.Time
}

// SystemStatus represents the snapshot of the system's operational state.
type SystemStatus struct {
	Hostname     string   `json:"hostname"`
	Uptime       string   `json:"uptime"`
	Time         string   `json:"time"`
	StartTime    int64    `json:"startTime"`
	RecentEvents []string `json:"recentEvents"`
}

// NewSystemBridge creates a new instance of SystemBridge.
//
// @returns A initialized SystemBridge.
func NewSystemBridge() *SystemBridge {
	return &SystemBridge{
		startTime: time.Now(),
	}
}

// Startup initializes the bridge with the Wails application context.
// This is called automatically by the Wails runtime.
//
// @param ctx - The Wails context.
func (s *SystemBridge) Startup(ctx context.Context) {
	s.ctx = ctx
}

// GetContext returns the stored Wails context.
func (s *SystemBridge) GetContext() context.Context {
	return s.ctx
}

// GetSystemStatus retrieves the current status of the system.
// It gathers hostname, uptime, and other metadata.
//
// @returns The system status object or an error.
func (s *SystemBridge) GetSystemStatus() (*SystemStatus, error) {
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}

	uptime := time.Since(s.startTime).Round(time.Second).String()

	// In a real scenario, RecentEvents might come from a log buffer or event bus.
	events := []string{
		"System initialized at " + s.startTime.Format("15:04:05"),
		"Database connection established",
		"Auth bridge ready",
		"Monitoring active",
	}

	return &SystemStatus{
		Hostname:     hostname,
		Uptime:       uptime,
		Time:         time.Now().Format(time.RFC3339),
		StartTime:    s.startTime.Unix(),
		RecentEvents: events,
	}, nil
}
