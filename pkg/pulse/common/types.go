package common

import "time"

// HostInfo contains static system information.
type HostInfo struct {
	Hostname      string   `json:"hostname"`
	OS            string   `json:"os"`
	Platform      string   `json:"platform"`
	PlatformFamily string  `json:"platform_family"`
	PlatformVersion string `json:"platform_version"`
	KernelVersion string   `json:"kernel_version"`
	Arch          string   `json:"arch"`
	MAC           []string `json:"mac"`
	IP            []string `json:"ip"`
	AgentVersion  string   `json:"agent_version"`
}

// SystemMetrics contains dynamic system telemetry.
type SystemMetrics struct {
	Timestamp   time.Time `json:"timestamp"`
	CPUPercent  float64   `json:"cpu_percent"` // Average usage
	MemoryTotal uint64    `json:"memory_total"`
	MemoryUsed  uint64    `json:"memory_used"`
	MemoryFree  uint64    `json:"memory_free"`
	Uptime      time.Duration `json:"uptime"`
	Load1       float64   `json:"load_1"`
	Load5       float64   `json:"load_5"`
	Load15      float64   `json:"load_15"`
}
