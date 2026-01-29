package pulse

import (
	"context"
	"fmt"
	"log"
	"sent/ent"
	"sent/pkg/orchestrator"
	"sent/pkg/pulse/common"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

type PulseManager struct {
	db    *ent.Client
	pool  *pgxpool.Pool
	river *river.Client[pgx.Tx]
}

func NewPulseManager(db *ent.Client, river *river.Client[pgx.Tx]) *PulseManager {
	// We need a raw connection pool for pgx features like CopyFrom
	// In a real app, we'd reuse the DSN from the database package.
	// For now, let's assume standard env vars or hardcoded for MVP.
	dsn := "postgres://postgres:postgres@localhost:5433/sent?sslmode=disable"
	
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Printf("Warning: Failed to create pgx pool for pulse: %v", err)
	}

	m := &PulseManager{
		db:    db,
		pool:  pool,
		river: river,
	}

	if pool != nil {
		m.InitSchema()
	}

	return m
}

func (m *PulseManager) HandleDeviceOffline(ctx context.Context, tenantID int, agentID int, hostname string) error {
	// 1. Enqueue Incident Response (Ticket in Pilot)
	if _, err := m.river.Insert(ctx, orchestrator.IncidentResponseArgs{
		TenantID:  tenantID,
		SourceApp: "pulse",
		DeviceID:  agentID,
		AlertName: "Device Offline",
		Details:   fmt.Sprintf("Agent on hostname '%s' has stopped heartbeating. Investigation required.", hostname),
	}, nil); err != nil {
		return fmt.Errorf("failed to enqueue incident response: %w", err)
	}

	// 2. Enqueue Health Recalculation (Horizon)
	if _, err := m.river.Insert(ctx, orchestrator.HealthUpdateArgs{
		TenantID: tenantID,
	}, nil); err != nil {
		log.Printf("Warning: failed to enqueue health update: %v", err)
	}

	return nil
}

func (m *PulseManager) InitSchema() {
	statements := strings.Split(TelemetrySchema, ";")
	for _, stmt := range statements {
		trimmed := strings.TrimSpace(stmt)
		if trimmed == "" {
			continue
		}
		_, err := m.pool.Exec(context.Background(), trimmed)
		if err != nil {
			log.Printf("Error executing schema statement: %v\nStatement: %s", err, trimmed)
		}
	}
}

func (m *PulseManager) IngestBatch(agentID string, batch []*common.SystemMetrics) error {
	if m.pool == nil {
		return fmt.Errorf("telemetry pool not initialized")
	}

	ctx := context.Background()
	
	// Convert metrics to rows for CopyFrom
	rows := make([][]any, len(batch))
	for i, metric := range batch {
		rows[i] = []any{
			metric.Timestamp,
			agentID,
			metric.CPUPercent,
			int64(metric.MemoryTotal),
			int64(metric.MemoryUsed),
			int64(metric.MemoryFree),
			metric.Load1,
			metric.Load5,
			metric.Load15,
		}
	}

	_, err := m.pool.CopyFrom(
		ctx,
		pgx.Identifier{"pulse_telemetry"},
		[]string{"time", "agent_id", "cpu_percent", "mem_total", "mem_used", "mem_free", "load_1", "load_5", "load_15"},
		pgx.CopyFromRows(rows),
	)

	return err
}

func (m *PulseManager) Close() {
	if m.pool != nil {
		m.pool.Close()
	}
}
