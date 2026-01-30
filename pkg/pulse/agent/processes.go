package agent

import (
	"fmt"
	"sort"

	"github.com/shirou/gopsutil/v3/process"
)

type ProcessInfo struct {
	PID      int32   `json:"pid"`
	Name     string  `json:"name"`
	Username string  `json:"username"`
	CPU      float64 `json:"cpu"`
	Memory   uint64  `json:"memory"` // RSS in bytes
}

// GetProcesses returns a list of running processes
func GetProcesses() ([]ProcessInfo, error) {
	procs, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var results []ProcessInfo
	for _, p := range procs {
		name, _ := p.Name()
		user, _ := p.Username()
		cpu, _ := p.CPUPercent()
		memInfo, _ := p.MemoryInfo()
		
		mem := uint64(0)
		if memInfo != nil {
			mem = memInfo.RSS
		}

		results = append(results, ProcessInfo{
			PID:      p.Pid,
			Name:     name,
			Username: user,
			CPU:      cpu,
			Memory:   mem,
		})
	}
    
    // Sort by CPU usage descending
    sort.Slice(results, func(i, j int) bool {
        return results[i].CPU > results[j].CPU
    })

	// Limit to top 100 to avoid overwhelming the frontend
	if len(results) > 100 {
		results = results[:100]
	}

	return results, nil
}

// KillProcess terminates a process by PID
func KillProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return fmt.Errorf("process not found: %w", err)
	}
	return p.Kill()
}
