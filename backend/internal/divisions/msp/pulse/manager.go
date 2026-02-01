package pulse

import (
	"context"
	"fmt"
	"log"
	"sent/internal/divisions/msp/pulse/common"
	"sent/internal/platform/orchestrator"
	"strings"
	"sync"
	"time"

	pulsedb "sent/internal/db/msp/pulse/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

type PulseManager struct {
	pool    *pgxpool.Pool
	queries *pulsedb.Queries
	river   *river.Client[pgx.Tx]
}

func (m *PulseManager) SetRiverClient(r *river.Client[pgx.Tx]) {
	m.river = r
}

func NewPulseManager(pool *pgxpool.Pool, riverClient *river.Client[pgx.Tx]) *PulseManager {
	m := &PulseManager{
		pool:    pool,
		queries: pulsedb.New(pool),
		river:   riverClient,
	}

	if pool != nil {
		m.InitSchema()
	}

	return m
}

func (m *PulseManager) HandleDeviceOffline(ctx context.Context, tenantID int, agentID int, hostname string) error {
	// ... (noise control)
	if m.isAlertSuppressed(agentID, "Device Offline") {
		log.Printf("[PULSE] Suppressing duplicate offline alert for %s", hostname)
		return nil
	}
	m.suppressAlert(agentID, "Device Offline", 15*time.Minute)

	// 1. Enqueue Incident Response (Ticket in Pilot)
	if _, err := m.river.Insert(ctx, orchestrator.IncidentResponseArgs{
		TenantID:  tenantID,
		SourceApp: "pulse",
		DeviceID:  agentID,
		AlertName: "Device Offline",
		Details:   fmt.Sprintf("Agent on hostname '%s' has stopped heartbeating. Investigation required.", hostname),
		DeepLink:  fmt.Sprintf("/pulse/inventory?agentId=%d", agentID),
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

func (m *PulseManager) HandleHighRAMUsage(ctx context.Context, tenantID int, agentID int, hostname string, usedPercent float64) error {
	if m.isAlertSuppressed(agentID, "High RAM Usage") {
		return nil
	}
	m.suppressAlert(agentID, "High RAM Usage", 30*time.Minute)

	// Execution Plan (Automation suggested)
	plan := map[string]interface{}{
		"suggested_actions": []map[string]interface{}{
			{"name": "Clear Temp Files", "script_id": "cleanup_temp_sh", "type": "script"},
			{"name": "Restart Print Spooler", "service": "spooler", "type": "service_restart"},
		},
	}

	if _, err := m.river.Insert(ctx, orchestrator.IncidentResponseArgs{
		TenantID:      tenantID,
		SourceApp:     "pulse",
		DeviceID:      agentID,
		AlertName:     "High RAM Usage",
		Details:       fmt.Sprintf("Device %s is using %.1f%% of RAM. This exceeded the 90%% threshold.", hostname, usedPercent),
		DeepLink:      fmt.Sprintf("/pulse/devices/%d/processes", agentID),
		ExecutionPlan: plan,
	}, nil); err != nil {
		return err
	}

	return nil
}

// In-Memory Alert Suppression (MVP)
// Map[AgentID_AlertName] -> SuppressionExpiryTime
var alertSuppression sync.Map

func (m *PulseManager) isAlertSuppressed(agentID int, alertName string) bool {
	key := fmt.Sprintf("%d_%s", agentID, alertName)
	val, ok := alertSuppression.Load(key)
	if !ok {
		return false
	}
	expiry := val.(time.Time)
	if time.Now().After(expiry) {
		alertSuppression.Delete(key)
		return false
	}
	return true
}

func (m *PulseManager) suppressAlert(agentID int, alertName string, duration time.Duration) {
	key := fmt.Sprintf("%d_%s", agentID, alertName)
	alertSuppression.Store(key, time.Now().Add(duration))
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

// HandleUnauthorizedWork checks if the active user is currently on leave
func (m *PulseManager) HandleUnauthorizedWork(ctx context.Context, tenantID int, hardwareID string, osUser string) error {
	// 1. Find Asset and Owner
	asset, err := m.queries.GetAssetByHardwareID(ctx, pgtype.Text{String: hardwareID, Valid: true})
	if err != nil || !asset.Email.Valid {
		return nil // No owner to check against or asset not found
	}

	// 2. Find Employee record linked to User (via Email)
	// For MVP, assuming we can use people module queries or a separate one in pulse
	// I'll use a direct query here or assume it's available.
	// Actually, I'll add a helper to pulsedb for this if not present.
	var empID int32
	var empFullName string
	err = m.pool.QueryRow(ctx, "SELECT id, first_name || ' ' || last_name FROM employees WHERE email = $1", asset.Email.String).Scan(&empID, &empFullName)
	if err != nil {
		return nil // No employee record found for this user
	}

	// 3. Check for Active Time Off
	onLeave, err := m.queries.CheckEmployeeOnLeave(ctx, pulsedb.CheckEmployeeOnLeaveParams{
		EmployeeID: empID,
		StartDate:  pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
	if err != nil {
		return err
	}

	if onLeave {
		// VIOLATION DETECTED
		if m.isAlertSuppressed(int(asset.ID), "Unauthorized Work") {
			return nil
		}
		m.suppressAlert(int(asset.ID), "Unauthorized Work", 24*time.Hour)

		log.Printf("[PULSE] Unauthorized Work Detected for %s (Asset: %d)", asset.Email.String, asset.ID)

		// Trigger Incident response via River
		if m.river != nil {
			_, err = m.river.Insert(ctx, orchestrator.IncidentResponseArgs{
				TenantID:  tenantID,
				SourceApp: "pulse",
				DeviceID:  int(asset.ID),
				AlertName: "Unauthorized Work During Leave",
				Details:   fmt.Sprintf("Employee %s (%s) is logged into device '%s' while on approved leave.", empFullName, asset.Email.String, asset.Name),
				DeepLink:  fmt.Sprintf("/people/employees/%d", empID),
			}, nil)
		}
		return err
	}

	return nil
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

		// TRIGGER: Check for Unauthorized Work (RMM-HR Integration)
		if metric.ActiveUser != "" && metric.ActiveUser != "root" && metric.ActiveUser != "unknown" {
			// We do this in a goroutine to not block ingestion
			go func(activeUser string) {
				// For MVP, assuming tenantID=1. In real app, look up from agent reg.
				_ = m.HandleUnauthorizedWork(context.Background(), 1, agentID, activeUser)
			}(metric.ActiveUser)
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
