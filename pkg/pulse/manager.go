package pulse

import (
	"context"
	"fmt"
	"log"
	"sent/ent"
	"sent/pkg/orchestrator"
	"sent/pkg/pulse/common"
	"strings"
	"sync"
    "time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
    
    "sent/ent/asset"
    "sent/ent/employee"
    "sent/ent/timeoffrequest"
)

type PulseManager struct {
	db    *ent.Client
	pool  *pgxpool.Pool
	river *river.Client[pgx.Tx]
}

func (m *PulseManager) SetRiverClient(r *river.Client[pgx.Tx]) {
	m.river = r
}

func NewPulseManager(db *ent.Client, riverClient *river.Client[pgx.Tx]) *PulseManager {
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
		river: riverClient,
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
    a, err := m.db.Asset.Query().
        Where(asset.HardwareIDEQ(hardwareID)).
        WithOwner().
        Only(ctx)
    
    // If not found or no owner, skip
    if err != nil || a.Edges.Owner == nil {
        return nil // No owner to check against
    }
    
    owner := a.Edges.Owner
    
    // 2. Find Employee record linked to User
    // User -> (Email) -> Employee
    emp, err := m.db.Employee.Query().
        Where(employee.EmailEQ(owner.Email)).
        Only(ctx)
        
    if err != nil {
        return nil // No employee record
    }
    
    // 3. Check for Active Time Off
    now := time.Now()
    onLeave, err := m.db.TimeOffRequest.Query().
        Where(
            timeoffrequest.HasEmployeeWith(employee.ID(emp.ID)),
            timeoffrequest.StatusEQ("APPROVED"),
            timeoffrequest.StartDateLTE(now),
            timeoffrequest.EndDateGTE(now),
        ).
        Exist(ctx)
        
    if err != nil {
        return err
    }
    
    if onLeave {
        // VIOLATION DETECTED
        // Check suppression first
        // We use int ID for suppression key if possible, or hash string? 
        // Existing isAlertSuppressed takes int agentID. Let's use Asset ID.
        if m.isAlertSuppressed(a.ID, "Unauthorized Work") {
            return nil
        }
        m.suppressAlert(a.ID, "Unauthorized Work", 24*time.Hour)
        
        log.Printf("[PULSE] Unauthorized Work Detected for %s (Asset: %d)", emp.Email, a.ID)
        
        // Trigger Incident
        _, err = m.river.Insert(ctx, orchestrator.IncidentResponseArgs{
            TenantID: tenantID,
            SourceApp: "pulse",
            DeviceID: a.ID,
            AlertName: "Unauthorized Work During Leave",
            Details: fmt.Sprintf("Employee %s (%s) is logged into device '%s' while on approved leave.", emp.FirstName + " " + emp.LastName, emp.Email, a.Name),
            DeepLink: fmt.Sprintf("/people/employees/%s", emp.ID),
        }, nil)
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
