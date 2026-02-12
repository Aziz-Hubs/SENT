// Package store provides data access for SENTpulse entities.
package store

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"sent-platform/internal/modules/sentmsp/sentpulse/core"
)

// DeviceRepository handles device data operations.
type DeviceRepository struct {
	db *pgxpool.Pool
}

// NewDeviceRepository creates a new device repository.
func NewDeviceRepository(db *pgxpool.Pool) *DeviceRepository {
	return &DeviceRepository{db: db}
}

// ListDevices returns paginated devices for an organization.
func (r *DeviceRepository) ListDevices(ctx context.Context, orgID string, limit, offset int32) ([]core.Device, int32, error) {
	// Get total count
	var total int32
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM devices WHERE organization_id = $1`, orgID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get devices
	rows, err := r.db.Query(ctx, `
		SELECT id, organization_id, site_id, name, type, status, os, COALESCE(os_version, ''), COALESCE(ip, ''), 
		       last_seen, cpu_usage, memory_usage, disk_usage, tags, COALESCE(client, ''), COALESCE(site, ''), 
		       created_at, updated_at,
		       COALESCE(local_ip, ''), COALESCE(mac_address, ''), boot_time, COALESCE("current_user", ''),
		       os_info, hardware, network_interfaces, storage_drives, installed_software, processes, patches, services, security, audit_log,
		       COALESCE(rustdesk_id, ''), COALESCE(rustdesk_password, '')
		FROM devices
		WHERE organization_id = $1
		ORDER BY name ASC
		LIMIT $2 OFFSET $3
	`, orgID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var devices []core.Device
	for rows.Next() {
		var d core.Device
		var tags []string
		err := rows.Scan(
			&d.ID, &d.OrganizationID, &d.SiteID, &d.Name, &d.Type, &d.Status,
			&d.OS, &d.OSVersion, &d.IP, &d.LastSeen, &d.CPUUsage, &d.MemoryUsage,
			&d.DiskUsage, &tags, &d.Client, &d.Site, &d.CreatedAt, &d.UpdatedAt,
			&d.LocalIP, &d.MACAddress, &d.BootTime, &d.CurrentUser,
			&d.OSInfo, &d.Hardware, &d.NetworkInterfaces, &d.StorageDrives, &d.InstalledSoftware, &d.Processes, &d.Patches, &d.Services, &d.Security, &d.AuditLog,
			&d.RustDeskID, &d.RustDeskPassword,
		)
		if err != nil {
			return nil, 0, err
		}
		d.Tags = tags
		devices = append(devices, d)
	}

	return devices, total, nil
}

// GetDevice returns a single device by ID.
func (r *DeviceRepository) GetDevice(ctx context.Context, id string) (*core.Device, error) {
	var d core.Device
	var tags []string
	err := r.db.QueryRow(ctx, `
		SELECT id, organization_id, site_id, name, type, status, os, COALESCE(os_version, ''), COALESCE(ip, ''), 
		       last_seen, cpu_usage, memory_usage, disk_usage, tags, COALESCE(client, ''), COALESCE(site, ''), 
		       created_at, updated_at,
		       COALESCE(local_ip, ''), COALESCE(mac_address, ''), boot_time, COALESCE("current_user", ''),
		       os_info, hardware, network_interfaces, storage_drives, installed_software, processes, patches, services, security, audit_log,
		       COALESCE(rustdesk_id, ''), COALESCE(rustdesk_password, '')
		FROM devices WHERE id = $1
	`, id).Scan(
		&d.ID, &d.OrganizationID, &d.SiteID, &d.Name, &d.Type, &d.Status,
		&d.OS, &d.OSVersion, &d.IP, &d.LastSeen, &d.CPUUsage, &d.MemoryUsage,
		&d.DiskUsage, &tags, &d.Client, &d.Site, &d.CreatedAt, &d.UpdatedAt,
		&d.LocalIP, &d.MACAddress, &d.BootTime, &d.CurrentUser,
		&d.OSInfo, &d.Hardware, &d.NetworkInterfaces, &d.StorageDrives, &d.InstalledSoftware, &d.Processes, &d.Patches, &d.Services, &d.Security, &d.AuditLog,
		&d.RustDeskID, &d.RustDeskPassword,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	d.Tags = tags
	return &d, nil
}

// GetStats returns aggregated device and alert statistics.
func (r *DeviceRepository) GetStats(ctx context.Context, orgID string) (*core.Stats, error) {
	var stats core.Stats

	// Device stats
	err := r.db.QueryRow(ctx, `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE status = 'online'),
			COUNT(*) FILTER (WHERE status = 'offline'),
			COUNT(*) FILTER (WHERE status = 'warning')
		FROM devices WHERE organization_id = $1
	`, orgID).Scan(&stats.TotalDevices, &stats.Online, &stats.Offline, &stats.Warning)
	if err != nil {
		return nil, err
	}

	// Critical alerts count
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM alerts 
		WHERE organization_id = $1 AND severity = 'critical' AND acknowledged = FALSE
	`, orgID).Scan(&stats.CriticalAlerts)
	if err != nil {
		return nil, err
	}

	// Calculate health score
	if stats.TotalDevices > 0 {
		stats.HealthScore = int32((float64(stats.Online) / float64(stats.TotalDevices)) * 100)
	}

	return &stats, nil
}

// CreateDevice creates a new device and returns it.
func (r *DeviceRepository) CreateDevice(ctx context.Context, d *core.Device) (*core.Device, error) {
	d.ID = uuid.New().String()
	d.CreatedAt = time.Now()
	d.UpdatedAt = time.Now()
	d.LastSeen = time.Now()

	_, err := r.db.Exec(ctx, `
		INSERT INTO devices (id, organization_id, site_id, name, type, status, os, os_version, 
		                     ip, last_seen, cpu_usage, memory_usage, disk_usage, tags, client, site,
		                     created_at, updated_at,
		                     local_ip, mac_address, boot_time, "current_user",
		                     os_info, hardware, network_interfaces, storage_drives, installed_software, processes, patches, services, security, audit_log,
		                     rustdesk_id, rustdesk_password)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
		        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
	`, d.ID, d.OrganizationID, d.SiteID, d.Name, d.Type, d.Status, d.OS, d.OSVersion,
		d.IP, d.LastSeen, d.CPUUsage, d.MemoryUsage, d.DiskUsage, d.Tags, d.Client, d.Site,
		d.CreatedAt, d.UpdatedAt,
		d.LocalIP, d.MACAddress, d.BootTime, d.CurrentUser,
		d.OSInfo, d.Hardware, d.NetworkInterfaces, d.StorageDrives, d.InstalledSoftware, d.Processes, d.Patches, d.Services, d.Security, d.AuditLog,
		d.RustDeskID, d.RustDeskPassword)
	if err != nil {
		return nil, err
	}

	return d, nil
}

// UpsertDevice creates or updates a device based on OrganizationID and Name.
func (r *DeviceRepository) UpsertDevice(ctx context.Context, d *core.Device) (*core.Device, error) {
	// Check if device exists
	var existingID string
	err := r.db.QueryRow(ctx, "SELECT id FROM devices WHERE organization_id = $1 AND name = $2", d.OrganizationID, d.Name).Scan(&existingID)

	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	if existingID != "" {
		// Update
		d.ID = existingID
		d.UpdatedAt = time.Now()
		d.LastSeen = time.Now()
		_, err = r.db.Exec(ctx, `
			UPDATE devices 
			SET type = $2, status = $3, os = $4, os_version = $5, ip = $6, last_seen = $7,
				cpu_usage = $8, memory_usage = $9, disk_usage = $10, tags = $11, client = $12, site = $13,
				updated_at = $14,
				local_ip = $15, mac_address = $16, boot_time = $17, "current_user" = $18,
				os_info = $19, hardware = $20, network_interfaces = $21, storage_drives = $22,
				installed_software = $23, processes = $24, patches = $25, services = $26, security = $27, audit_log = $28,
				rustdesk_id = $29, rustdesk_password = $30
			WHERE id = $1
		`, d.ID, d.Type, d.Status, d.OS, d.OSVersion, d.IP, d.LastSeen,
			d.CPUUsage, d.MemoryUsage, d.DiskUsage, d.Tags, d.Client, d.Site, d.UpdatedAt,
			d.LocalIP, d.MACAddress, d.BootTime, d.CurrentUser,
			d.OSInfo, d.Hardware, d.NetworkInterfaces, d.StorageDrives, d.InstalledSoftware, d.Processes, d.Patches, d.Services, d.Security, d.AuditLog,
			d.RustDeskID, d.RustDeskPassword)
		if err != nil {
			return nil, err
		}
	} else {
		// Create
		return r.CreateDevice(ctx, d)
	}

	return d, nil
}

// RecordTelemetry logs a device's current metrics to the historical telemetry table.
func (r *DeviceRepository) RecordTelemetry(ctx context.Context, deviceID string, cpu, mem, disk float32) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO device_telemetry (time, device_id, cpu_usage, memory_usage, disk_usage)
		VALUES (NOW(), $1, $2, $3, $4)
	`, deviceID, cpu, mem, disk)
	return err
}

// GetTelemetryHistory fetches historical metrics for a device.
func (r *DeviceRepository) GetTelemetryHistory(ctx context.Context, deviceID string, start, end time.Time) ([]core.TelemetryPoint, error) {
	rows, err := r.db.Query(ctx, `
		SELECT time, cpu_usage, memory_usage, disk_usage 
		FROM device_telemetry 
		WHERE device_id = $1 AND time >= $2 AND time <= $3
		ORDER BY time ASC
	`, deviceID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var points []core.TelemetryPoint
	for rows.Next() {
		var p core.TelemetryPoint
		if err := rows.Scan(&p.Time, &p.CPUUsage, &p.MemoryUsage, &p.DiskUsage); err != nil {
			return nil, err
		}
		points = append(points, p)
	}
	return points, nil
}

// AlertRepository handles alert data operations.
type AlertRepository struct {
	db *pgxpool.Pool
}

// NewAlertRepository creates a new alert repository.
func NewAlertRepository(db *pgxpool.Pool) *AlertRepository {
	return &AlertRepository{db: db}
}

// ListAlerts returns alerts for an organization.
func (r *AlertRepository) ListAlerts(ctx context.Context, orgID string, limit int32, unresolvedOnly bool) ([]core.Alert, error) {
	query := `
		SELECT id, organization_id, device_id, device_name, severity, title, description,
		       acknowledged, acknowledged_by, acknowledged_at, resolved, resolved_at, created_at
		FROM alerts
		WHERE organization_id = $1
	`
	if unresolvedOnly {
		query += " AND resolved = FALSE"
	}
	query += " ORDER BY created_at DESC LIMIT $2"

	rows, err := r.db.Query(ctx, query, orgID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []core.Alert
	for rows.Next() {
		var a core.Alert
		err := rows.Scan(
			&a.ID, &a.OrganizationID, &a.DeviceID, &a.DeviceName, &a.Severity,
			&a.Title, &a.Description, &a.Acknowledged, &a.AcknowledgedBy,
			&a.AcknowledgedAt, &a.Resolved, &a.ResolvedAt, &a.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}

	return alerts, nil
}

// CreateAlert creates a new alert.
func (r *AlertRepository) CreateAlert(ctx context.Context, a *core.Alert) (*core.Alert, error) {
	a.ID = uuid.New().String()
	a.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, `
		INSERT INTO alerts (id, organization_id, device_id, device_name, severity, title, description, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, a.ID, a.OrganizationID, a.DeviceID, a.DeviceName, a.Severity, a.Title, a.Description, a.CreatedAt)
	if err != nil {
		return nil, err
	}

	return a, nil
}

// AcknowledgeAlert marks an alert as acknowledged.
func (r *AlertRepository) AcknowledgeAlert(ctx context.Context, alertID, userID string) error {
	now := time.Now()
	_, err := r.db.Exec(ctx, `
		UPDATE alerts SET acknowledged = TRUE, acknowledged_by = $2, acknowledged_at = $3
		WHERE id = $1
	`, alertID, userID, now)
	return err
}

// ScriptRepository handles script data operations.
type ScriptRepository struct {
	db *pgxpool.Pool
}

// NewScriptRepository creates a new script repository.
func NewScriptRepository(db *pgxpool.Pool) *ScriptRepository {
	return &ScriptRepository{db: db}
}

// ListScripts returns all scripts for an organization.
func (r *ScriptRepository) ListScripts(ctx context.Context, orgID string) ([]core.Script, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, organization_id, name, description, language, content, last_run, 
		       success_rate, tags, created_by, created_at, updated_at
		FROM scripts
		WHERE organization_id = $1
		ORDER BY name ASC
	`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scripts []core.Script
	for rows.Next() {
		var s core.Script
		var tags []string
		err := rows.Scan(
			&s.ID, &s.OrganizationID, &s.Name, &s.Description, &s.Language,
			&s.Content, &s.LastRun, &s.SuccessRate, &tags, &s.CreatedBy,
			&s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		s.Tags = tags
		scripts = append(scripts, s)
	}

	return scripts, nil
}

// CreateExecution creates a new script execution.
func (r *ScriptRepository) CreateExecution(ctx context.Context, e *core.ScriptExecution) error {
	e.ID = uuid.New().String()
	e.CreatedAt = time.Now()
	// Default status if not set
	if e.Status == "" {
		e.Status = core.ExecutionStatusPending
	}

	_, err := r.db.Exec(ctx, `
		INSERT INTO script_executions (id, script_id, device_id, executed_by, status, adhoc_command, adhoc_language, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, e.ID, e.ScriptID, e.DeviceID, e.ExecutedBy, e.Status, e.AdhocCommand, e.AdhocLanguage, e.CreatedAt)
	return err
}

// GetPendingExecutions returns pending executions for a device.
func (r *ScriptRepository) GetPendingExecutions(ctx context.Context, deviceID string) ([]core.ScriptExecution, error) {
	// We join to get content/language if it's a saved script
	rows, err := r.db.Query(ctx, `
		SELECT se.id, se.script_id, se.device_id, se.executed_by, se.status, 
		       COALESCE(se.adhoc_command, s.content, ''), 
		       COALESCE(se.adhoc_language, s.language, 'powershell'),
		       se.created_at
		FROM script_executions se
		LEFT JOIN scripts s ON se.script_id = s.id
		WHERE se.device_id = $1 AND se.status = 'pending'
	`, deviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var executions []core.ScriptExecution
	for rows.Next() {
		var e core.ScriptExecution
		// Reusing AdhocCommand/AdhocLanguage fields to store the resolved command/language
		var scriptID *string
		err := rows.Scan(
			&e.ID, &scriptID, &e.DeviceID, &e.ExecutedBy, &e.Status,
			&e.AdhocCommand, &e.AdhocLanguage, &e.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		e.ScriptID = scriptID
		executions = append(executions, e)
	}
	return executions, nil
}

// UpdateExecutionStatus updates the status of an execution.
func (r *ScriptRepository) UpdateExecutionStatus(ctx context.Context, id string, status core.ExecutionStatus, stdout, stderr string, exitCode int) error {
	now := time.Now()
	var startedAt *time.Time
	if status == core.ExecutionStatusRunning {
		startedAt = &now
		_, err := r.db.Exec(ctx, `
			UPDATE script_executions 
			SET status = $2, started_at = $3
			WHERE id = $1
		`, id, status, startedAt)
		return err
	}

	// Completed
	_, err := r.db.Exec(ctx, `
		UPDATE script_executions 
		SET status = $2, stdout = $3, stderr = $4, exit_code = $5, completed_at = $6
		WHERE id = $1
	`, id, status, stdout, stderr, exitCode, now)
	return err
}

// UpdateDeviceStatus updates the status of a device.
func (r *DeviceRepository) UpdateDeviceStatus(ctx context.Context, id string, status core.DeviceStatus) error {
	_, err := r.db.Exec(ctx, `UPDATE devices SET status = $2, updated_at = $3 WHERE id = $1`, id, status, time.Now())
	return err
}

// FindDevicesLastSeenBefore returns devices that haven't been seen since the given time.
func (r *DeviceRepository) FindDevicesLastSeenBefore(ctx context.Context, threshold time.Time) ([]core.Device, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, organization_id, site_id, name, type, status, os, COALESCE(os_version, ''), COALESCE(ip, ''), 
		       last_seen, cpu_usage, memory_usage, disk_usage, tags, COALESCE(client, ''), COALESCE(site, ''), 
		       created_at, updated_at
		FROM devices
		WHERE last_seen < $1 AND status != 'offline'
	`, threshold)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []core.Device
	for rows.Next() {
		var d core.Device
		var tags []string
		err := rows.Scan(
			&d.ID, &d.OrganizationID, &d.SiteID, &d.Name, &d.Type, &d.Status,
			&d.OS, &d.OSVersion, &d.IP, &d.LastSeen, &d.CPUUsage, &d.MemoryUsage,
			&d.DiskUsage, &tags, &d.Client, &d.Site, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		d.Tags = tags
		devices = append(devices, d)
	}
	return devices, nil
}

// FindHighUsageDevices returns devices exceeding resource thresholds.
// metric: "cpu_usage", "memory_usage", "disk_usage"
func (r *DeviceRepository) FindHighUsageDevices(ctx context.Context, metric string, threshold float32) ([]core.Device, error) {
	// Note: Validating metric name to prevent SQL injection is important in real app
	var query string
	switch metric {
	case "cpu_usage":
		query = `SELECT id, organization_id, name, cpu_usage FROM devices WHERE cpu_usage > $1 AND status = 'online'`
	case "memory_usage":
		query = `SELECT id, organization_id, name, memory_usage FROM devices WHERE memory_usage > $1 AND status = 'online'`
	case "disk_usage":
		query = `SELECT id, organization_id, name, disk_usage FROM devices WHERE disk_usage > $1 AND status = 'online'`
	default:
		return nil, nil
	}

	rows, err := r.db.Query(ctx, query, threshold)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []core.Device
	for rows.Next() {
		var d core.Device
		// We only scan minimal fields needed for alert
		err := rows.Scan(&d.ID, &d.OrganizationID, &d.Name, &d.CPUUsage) // Re-using CPUUsage field to hold the value
		if err != nil {
			// Try scanning memory/disk if that was the query
			// Actually simpler to just scan full device for reuse
			continue
		}
		devices = append(devices, d)
	}
	return devices, nil
}

// FindRecentAlert checks if an alert of the same title was created recently for the device.
func (r *AlertRepository) FindRecentAlert(ctx context.Context, deviceID, alertType string, since time.Time) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM alerts 
			WHERE device_id = $1 AND title = $2 AND created_at > $3
		)
	`, deviceID, alertType, since).Scan(&exists)
	return exists, err
}

// SettingsRepository handles organization settings data operations.
type SettingsRepository struct {
	db *pgxpool.Pool
}

// NewSettingsRepository creates a new settings repository.
func NewSettingsRepository(db *pgxpool.Pool) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// ListAllOrganizations returns a list of all organization IDs that have pulse settings.
func (r *SettingsRepository) ListAllOrganizations(ctx context.Context) ([]string, error) {
	rows, err := r.db.Query(ctx, `SELECT organization_id FROM pulse_settings`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgIDs []string
	for rows.Next() {
		var orgID string
		if err := rows.Scan(&orgID); err != nil {
			return nil, err
		}
		orgIDs = append(orgIDs, orgID)
	}
	return orgIDs, nil
}

// GetSettings returns monitoring settings for an organization.
func (r *SettingsRepository) GetSettings(ctx context.Context, orgID string) (*core.PulseSettings, error) {
	var s core.PulseSettings
	err := r.db.QueryRow(ctx, `
		SELECT organization_id, cpu_threshold, memory_threshold, disk_threshold, offline_threshold_minutes, created_at, updated_at
		FROM pulse_settings WHERE organization_id = $1
	`, orgID).Scan(&s.OrganizationID, &s.CPUThreshold, &s.MemoryThreshold, &s.DiskThreshold, &s.OfflineThresholdMinutes, &s.CreatedAt, &s.UpdatedAt)

	if err == pgx.ErrNoRows {
		// Return defaults if not found
		return &core.PulseSettings{
			OrganizationID:          orgID,
			CPUThreshold:            90.0,
			MemoryThreshold:         90.0,
			DiskThreshold:           90.0,
			OfflineThresholdMinutes: 5,
		}, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// UpdateSettings updates monitoring settings for an organization.
func (r *SettingsRepository) UpdateSettings(ctx context.Context, s *core.PulseSettings) error {
	s.UpdatedAt = time.Now()
	_, err := r.db.Exec(ctx, `
		INSERT INTO pulse_settings (organization_id, cpu_threshold, memory_threshold, disk_threshold, offline_threshold_minutes, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (organization_id) DO UPDATE SET
			cpu_threshold = EXCLUDED.cpu_threshold,
			memory_threshold = EXCLUDED.memory_threshold,
			disk_threshold = EXCLUDED.disk_threshold,
			offline_threshold_minutes = EXCLUDED.offline_threshold_minutes,
			updated_at = EXCLUDED.updated_at
	`, s.OrganizationID, s.CPUThreshold, s.MemoryThreshold, s.DiskThreshold, s.OfflineThresholdMinutes, s.UpdatedAt)
	return err
}
