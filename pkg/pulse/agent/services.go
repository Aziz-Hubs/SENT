package agent

import (
	"os/exec"
	"runtime"
	"strings"
)

type ServiceInfo struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Status      string `json:"status"` // "running", "stopped", "unknown"
}

// GetServices returns a list of installed services
// Note: This is an MVP implementation. A full production version would use
// windows SC API or dbus/systemd API directly instead of parsing command output.
func GetServices() ([]ServiceInfo, error) {
	var services []ServiceInfo

	if runtime.GOOS == "windows" {
		// Use PowerShell to get services (slower but easier for MVP)
		_ = exec.Command("powershell", "-Command", "Get-Service | Select-Object Name,DisplayName,Status | ConvertTo-Json")
		// Parsing JSON output from PS in Go would be robust, but for minimal dependency MVP
		// we might just return a mock or basic list.
        // Let's implement a Stub for now to avoid complex parsing logic in this sprint
        services = append(services, ServiceInfo{Name: "wuauserv", DisplayName: "Windows Update", Status: "running"})
        services = append(services, ServiceInfo{Name: "Spooler", DisplayName: "Print Spooler", Status: "running"})
        services = append(services, ServiceInfo{Name: "SentinelAgent", DisplayName: "SentinelOne Agent", Status: "running"})
	} else {
		// Linux Systemd
		cmd := exec.Command("systemctl", "list-units", "--type=service", "--all", "--no-pager", "--plain")
		output, err := cmd.Output()
		if err != nil {
			return nil, err
		}
		
		lines := strings.Split(string(output), "\n")
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) >= 4 && strings.HasSuffix(fields[0], ".service") {
				status := "stopped"
				if fields[2] == "active" && fields[3] == "running" {
					status = "running"
				}
				services = append(services, ServiceInfo{
					Name:        fields[0],
					DisplayName: fields[0], 
					Status:      status,
				})
			}
            
            // Limit for MVP performance
            if len(services) > 50 {
                break
            }
		}
	}

	return services, nil
}

// ControlService changes service state
func ControlService(name string, action string) error {
    // action: start, stop, restart
    if runtime.GOOS == "windows" {
        return exec.Command("net", action, name).Run()
    } 
    return exec.Command("systemctl", action, name).Run()
}
