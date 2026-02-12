// Package core contains the core domain types for SENTpulse.
package core

import (
	"time"
)

// DeviceStatus represents the current state of a device.
type DeviceStatus string

const (
	DeviceStatusOnline      DeviceStatus = "online"
	DeviceStatusOffline     DeviceStatus = "offline"
	DeviceStatusWarning     DeviceStatus = "warning"
	DeviceStatusMaintenance DeviceStatus = "maintenance"
)

// DeviceType represents the category of a device.
type DeviceType string

const (
	DeviceTypeServer      DeviceType = "server"
	DeviceTypeWorkstation DeviceType = "workstation"
	DeviceTypeNetwork     DeviceType = "network"
	DeviceTypeIOT         DeviceType = "iot"
)

// OS represents the operating system of a device.
type OS string

const (
	OSWindows OS = "windows"
	OSLinux   OS = "linux"
	OSMacOS   OS = "macos"
)

// Device represents a monitored endpoint.
type Device struct {
	ID             string       `json:"id"`
	OrganizationID string       `json:"organization_id"`
	SiteID         *string      `json:"site_id,omitempty"`
	Name           string       `json:"name"`
	Type           DeviceType   `json:"type"`
	Status         DeviceStatus `json:"status"`
	OS             OS           `json:"os"`
	OSVersion      string       `json:"os_version"`
	IP             string       `json:"ip"`
	LastSeen       time.Time    `json:"last_seen"`
	CPUUsage       float32      `json:"cpu_usage"`
	MemoryUsage    float32      `json:"memory_usage"`
	DiskUsage      float32      `json:"disk_usage"`
	// Metadata
	Tags      []string  `json:"tags"`
	Client    string    `json:"client"`
	Site      string    `json:"site"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Remote Access
	RustDeskID       string `json:"rustdesk_id"`
	RustDeskPassword string `json:"rustdesk_password"`

	// Extended Details (JSONB)
	LocalIP           string              `json:"local_ip"`
	MACAddress        string              `json:"mac_address"`
	BootTime          *time.Time          `json:"boot_time,omitempty"`
	CurrentUser       string              `json:"current_user"`
	OSInfo            *OSInfo             `json:"os_info,omitempty"`
	Hardware          *HardwareInfo       `json:"hardware,omitempty"`
	NetworkInterfaces []NetworkInterface  `json:"network_interfaces,omitempty"`
	StorageDrives     []StorageDrive      `json:"storage_drives,omitempty"`
	InstalledSoftware []InstalledSoftware `json:"installed_software,omitempty"`
	Processes         []DeviceProcess     `json:"processes,omitempty"` // Generally not stored, but available for live view
	Patches           []Patch             `json:"patches,omitempty"`
	Services          []ServiceItem       `json:"services,omitempty"`
	Security          *SecurityPosture    `json:"security,omitempty"`
	AuditLog          []AuditLogEntry     `json:"audit_log,omitempty"` // Stored in separate table usually, but here for UI convenience?
}

type OSInfo struct {
	Name         string `json:"name"`
	Version      string `json:"version"`
	Build        string `json:"build"`
	Architecture string `json:"architecture"`
	Platform     string `json:"platform"`
}

type HardwareInfo struct {
	Manufacturer   string `json:"manufacturer"`
	Model          string `json:"model"`
	SerialNumber   string `json:"serial_number"`
	BIOSVersion    string `json:"bios_version"`
	ProcessorModel string `json:"processor_model"`
	ProcessorCores int32  `json:"processor_cores"`
	RAMTotalBytes  uint64 `json:"ram_total_bytes"`
	RAMUsedBytes   uint64 `json:"ram_used_bytes"`
}

type NetworkInterface struct {
	Name       string `json:"name"`
	MACAddress string `json:"mac_address"`
	IPv4       string `json:"ip_v4"`
	IPv6       string `json:"ip_v6"`
	Status     string `json:"status"`
}

type StorageDrive struct {
	Name        string `json:"name"`
	Model       string `json:"model"`
	TotalBytes  uint64 `json:"total_bytes"`
	UsedBytes   uint64 `json:"used_bytes"`
	SmartStatus string `json:"smart_status"`
	Type        string `json:"type"`
}

type InstalledSoftware struct {
	Name        string     `json:"name"`
	Version     string     `json:"version"`
	Publisher   string     `json:"publisher"`
	InstallDate *time.Time `json:"install_date,omitempty"`
}

type DeviceProcess struct {
	PID         int32   `json:"pid"`
	Name        string  `json:"name"`
	CPUPercent  float32 `json:"cpu_percent"`
	MemoryBytes uint64  `json:"memory_bytes"`
	User        string  `json:"user"`
	Status      string  `json:"status"`
}

type ServiceItem struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Status      string `json:"status"`
	StartType   string `json:"start_type"`
	Description string `json:"description"`
}

type Patch struct {
	ID          string     `json:"id"`
	KBID        string     `json:"kb_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Category    string     `json:"category"`
	Severity    string     `json:"severity"`
	SizeBytes   int64      `json:"size_bytes"`
	ReleaseDate *time.Time `json:"release_date,omitempty"`
	InstallDate *time.Time `json:"install_date,omitempty"`
	Status      string     `json:"status"`
}

type SecurityPosture struct {
	Antivirus         *AntivirusInfo `json:"antivirus,omitempty"`
	FirewallEnabled   bool           `json:"firewall_enabled"`
	EncryptionEnabled bool           `json:"encryption_enabled"`
}

type AntivirusInfo struct {
	Name      string `json:"name"`
	Status    string `json:"status"`
	IsUpdated bool   `json:"is_updated"`
}

type AuditLogEntry struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	User      string    `json:"user"`
	Category  string    `json:"category"`
	Details   string    `json:"details"`
}

// AlertSeverity represents the urgency level of an alert.
type AlertSeverity string

const (
	AlertSeverityInfo     AlertSeverity = "info"
	AlertSeverityWarning  AlertSeverity = "warning"
	AlertSeverityCritical AlertSeverity = "critical"
)

// Alert represents a system event requiring attention.
type Alert struct {
	ID             string        `json:"id"`
	OrganizationID string        `json:"organization_id"`
	DeviceID       string        `json:"device_id"`
	DeviceName     string        `json:"device_name"`
	Severity       AlertSeverity `json:"severity"`
	Title          string        `json:"title"`
	Description    string        `json:"description"`
	Acknowledged   bool          `json:"acknowledged"`
	AcknowledgedBy *string       `json:"acknowledged_by,omitempty"`
	AcknowledgedAt *time.Time    `json:"acknowledged_at,omitempty"`
	Resolved       bool          `json:"resolved"`
	ResolvedAt     *time.Time    `json:"resolved_at,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
}

// ScriptLanguage represents the scripting language.
type ScriptLanguage string

const (
	ScriptLanguagePowerShell        ScriptLanguage = "powershell"
	ScriptLanguageBash              ScriptLanguage = "bash"
	ScriptLanguagePython            ScriptLanguage = "python"
	ScriptLanguageReboot            ScriptLanguage = "reboot"
	ScriptLanguageShutdown          ScriptLanguage = "shutdown"
	ScriptLanguageStartService      ScriptLanguage = "start_service"
	ScriptLanguageStopService       ScriptLanguage = "stop_service"
	ScriptLanguageRestartService    ScriptLanguage = "restart_service"
	ScriptLanguageKillProcess       ScriptLanguage = "kill_process"
	ScriptLanguageInstallPatches    ScriptLanguage = "install_patches"
	ScriptLanguageCheckPatches      ScriptLanguage = "check_patches"
	ScriptLanguageStartFileExplorer ScriptLanguage = "start_file_explorer"
)

// Script represents an automation script.
type Script struct {
	ID             string         `json:"id"`
	OrganizationID string         `json:"organization_id"`
	Name           string         `json:"name"`
	Description    string         `json:"description"`
	Language       ScriptLanguage `json:"language"`
	Content        string         `json:"content"`
	LastRun        *time.Time     `json:"last_run,omitempty"`
	SuccessRate    int32          `json:"success_rate"`
	Tags           []string       `json:"tags"`
	CreatedBy      *string        `json:"created_by,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}

// ExecutionStatus represents the state of a script execution.
type ExecutionStatus string

const (
	ExecutionStatusPending ExecutionStatus = "pending"
	ExecutionStatusRunning ExecutionStatus = "running"
	ExecutionStatusSuccess ExecutionStatus = "success"
	ExecutionStatusFailed  ExecutionStatus = "failed"
)

// ScriptExecution represents a run of a script or ad-hoc command.
type ScriptExecution struct {
	ID            string          `json:"id"`
	ScriptID      *string         `json:"script_id,omitempty"`
	DeviceID      string          `json:"device_id"`
	ExecutedBy    *string         `json:"executed_by"`
	Status        ExecutionStatus `json:"status"`
	ExitCode      *int32          `json:"exit_code,omitempty"`
	Stdout        string          `json:"stdout"`
	Stderr        string          `json:"stderr"`
	AdhocCommand  string          `json:"adhoc_command,omitempty"`
	AdhocLanguage ScriptLanguage  `json:"adhoc_language,omitempty"`
	StartedAt     *time.Time      `json:"started_at,omitempty"`
	CompletedAt   *time.Time      `json:"completed_at,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
}

// Stats represents aggregated device and alert statistics.
type Stats struct {
	TotalDevices   int32 `json:"total_devices"`
	Online         int32 `json:"online"`
	Offline        int32 `json:"offline"`
	Warning        int32 `json:"warning"`
	CriticalAlerts int32 `json:"critical_alerts"`
	HealthScore    int32 `json:"health_score"`
}

// TelemetryPoint represents a single data point in Time-series.
type TelemetryPoint struct {
	Time        time.Time `json:"time"`
	CPUUsage    float32   `json:"cpu_usage"`
	MemoryUsage float32   `json:"memory_usage"`
	DiskUsage   float32   `json:"disk_usage"`
}

// PulseSettings represents the monitoring configuration for an organization.
type PulseSettings struct {
	OrganizationID          string    `json:"organization_id"`
	CPUThreshold            float32   `json:"cpu_threshold"`
	MemoryThreshold         float32   `json:"memory_threshold"`
	DiskThreshold           float32   `json:"disk_threshold"`
	OfflineThresholdMinutes int32     `json:"offline_threshold_minutes"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}
