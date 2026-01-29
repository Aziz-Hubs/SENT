package agent

import (
	"log"
	"time"

	"sent/pkg/pulse/common"

	"github.com/elastic/go-sysinfo"
)

type Collector struct{}

func NewCollector() *Collector {
	return &Collector{}
}

func (c *Collector) GetHostInfo() (*common.HostInfo, error) {
	host, err := sysinfo.Host()
	if err != nil {
		return nil, err
	}
	info := host.Info()

	// Get Network info for MAC/IP
	// sysinfo doesn't give IP/MAC easily in the host info struct directly in some versions,
	// but let's see what we can get. 
	// Actually, sysinfo.Host() gives a Host struct which has Info().
	// For IPs and MACs we might need net interface lookup, but let's start simple.

	return &common.HostInfo{
		Hostname:        info.Hostname,
		OS:              info.OS.Name,
		Platform:        info.OS.Platform,
		PlatformFamily:  info.OS.Family,
		PlatformVersion: info.OS.Version,
		KernelVersion:   info.KernelVersion,
		Arch:            info.Architecture,
		AgentVersion:    "0.0.1", // TODO: Get from build info
		MAC:             info.MACs,
		IP:              info.IPs,
	}, nil
}

func (c *Collector) GetMetrics() (*common.SystemMetrics, error) {
	host, err := sysinfo.Host()
	if err != nil {
		return nil, err
	}

	mem, err := host.Memory()
	if err != nil {
		log.Printf("Error getting memory info: %v", err)
	}

	// CPU usage is a bit tricky with sysinfo, it often requires a duration.
	// For now, let's just get what we can. 
	// sysinfo.Host().CPULoad() might be what we want? No, sysinfo has different ways.
	// Let's check existing docs or use a simple approach. 
	// Elastic's go-sysinfo usually requires taking two samples to calculate % or getting load.
	
	// Quick check on load avg
	// Not all OSs support load avg via this lib easily without platform specific calls.
	// But let's try populating what we can.
	
	metrics := &common.SystemMetrics{
		Timestamp: time.Now(),
		Uptime:    host.Info().Uptime(),
	}

	if mem != nil {
		metrics.MemoryTotal = mem.Total
		metrics.MemoryUsed = mem.Used
		metrics.MemoryFree = mem.Free
	}

	return metrics, nil
}
