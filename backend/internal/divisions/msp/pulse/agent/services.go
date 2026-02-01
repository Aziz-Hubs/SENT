package agent

import (
	"encoding/json"
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
		// Use PowerShell to get services as JSON
		// Get-Service | Select-Object Name,DisplayName,Status | ConvertTo-Json -Compress
		cmd := exec.Command("powershell", "-NoProfile", "-Command", "Get-Service | Select-Object Name,DisplayName,Status | ConvertTo-Json -Compress")
		output, err := cmd.Output()
		if err != nil {
			// Fallback or error
			return nil, err
		}

		// Parse JSON output
		// PowerShell ConvertTo-Json can return a single object or an array.
		// We need to handle both cases or ensure array.
		// Wrapping in @() in PS usually ensures array but let's try generic unmarshal.

		var rawServices []map[string]interface{}
		// Try unmarshal as array
		if err := json.Unmarshal(output, &rawServices); err != nil {
			// Try unmarshal as single object
			var singleService map[string]interface{}
			if err2 := json.Unmarshal(output, &singleService); err2 == nil {
				rawServices = append(rawServices, singleService)
			}
		}

		for _, s := range rawServices {
			name, _ := s["Name"].(string)
			displayName, _ := s["DisplayName"].(string)
			statusVal, _ := s["Status"].(float64) // PS JSON often returns integer for enum
			statusStr := "unknown"

			// Status 4=Running, 1=Stopped (Microsoft.PowerShell.Commands.ServiceControllerStatus)
			if statusVal == 4 {
				statusStr = "running"
			} else if statusVal == 1 {
				statusStr = "stopped"
			}

			services = append(services, ServiceInfo{
				Name:        name,
				DisplayName: displayName,
				Status:      statusStr,
			})
		}
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
