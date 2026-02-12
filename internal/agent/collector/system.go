package collector

import (
	"log"
	"math"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
)

// SystemInfo holds the telemetry data collected from the host.
type SystemInfo struct {
	Hostname    string
	OS          string
	Platform    string
	Uptime      uint64
	CPUPercent  float64
	MemTotal    uint64
	MemUsed     uint64
	DiskTotal   uint64
	DiskUsed    uint64
	CollectedAt time.Time
}

// Collect gathers the current system telemetry.
func Collect() (*SystemInfo, error) {
	info := &SystemInfo{
		CollectedAt: time.Now(),
	}

	// Host Info
	h, err := host.Info()
	if err != nil {
		log.Printf("Error getting host info: %v", err)
	} else {
		info.Hostname = h.Hostname
		info.OS = h.OS
		info.Platform = h.Platform
		info.Uptime = h.Uptime
	}

	// CPU Usage (total across all cores)
	c, err := cpu.Percent(0, false)
	if err != nil {
		log.Printf("Error getting cpu info: %v", err)
	} else if len(c) > 0 {
		info.CPUPercent = math.Round(c[0]*100) / 100
	}

	// Memory Usage
	v, err := mem.VirtualMemory()
	if err != nil {
		log.Printf("Error getting memory info: %v", err)
	} else {
		info.MemTotal = v.Total
		info.MemUsed = v.Used
	}

	// Disk Usage (Root path)
	// On Windows, this is usually "C:", on Linux "/"
	path := "/"
	if info.OS == "windows" {
		path = "C:"
	}
	d, err := disk.Usage(path)
	if err != nil {
		log.Printf("Error getting disk info for %s: %v", path, err)
	} else {
		info.DiskTotal = d.Total
		info.DiskUsed = d.Used
	}

	return info, nil
}
