package collector

import (
	"context"
	"os/exec"
	"runtime"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
	"strings"
)

// CollectServices gathers the list of system services.
func CollectServices(ctx context.Context) ([]*sentpulsev1.ServiceItem, error) {
	if runtime.GOOS == "windows" {
		return collectWindowsServices(ctx)
	}
	return collectLinuxServices(ctx)
}

func collectWindowsServices(ctx context.Context) ([]*sentpulsev1.ServiceItem, error) {
	// Use PowerShell to get services
	cmd := exec.CommandContext(ctx, "powershell", "-Command", "Get-Service | Select-Object Name, DisplayName, Status, StartType | ConvertTo-Json")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	// For MVP, we can parse this JSON or just use a simpler format.
	// Since I don't want to add a JSON parser for this specific struct right now if I can avoid it,
	// I'll use a tab-separated format which is easier to parse.
	cmd = exec.CommandContext(ctx, "powershell", "-Command", "Get-Service | ForEach-Object { $_.Name + \"`t\" + $_.DisplayName + \"`t\" + $_.Status + \"`t\" + $_.StartType }")
	output, err = cmd.Output()
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(output), "\n")
	services := make([]*sentpulsev1.ServiceItem, 0, len(lines))

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.Split(line, "\t")
		if len(parts) < 4 {
			continue
		}

		services = append(services, &sentpulsev1.ServiceItem{
			Name:        parts[0],
			DisplayName: parts[1],
			Status:      strings.ToLower(parts[2]),
			StartType:   strings.ToLower(parts[3]),
		})
	}

	return services, nil
}

func collectLinuxServices(ctx context.Context) ([]*sentpulsev1.ServiceItem, error) {
	// Use systemctl to get services
	// Format: UNIT LOAD ACTIVE SUB DESCRIPTION
	cmd := exec.CommandContext(ctx, "systemctl", "list-units", "--type=service", "--no-legend", "--all")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(output), "\n")
	services := make([]*sentpulsev1.ServiceItem, 0, len(lines))

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		// systemctl output columns are separated by spaces
		parts := strings.Fields(line)
		if len(parts) < 5 {
			continue
		}

		name := strings.TrimSuffix(parts[0], ".service")
		services = append(services, &sentpulsev1.ServiceItem{
			Name:        name,
			DisplayName: name,
			Status:      parts[3], // sub state (running, exited, etc.)
			Description: strings.Join(parts[4:], " "),
		})
	}

	return services, nil
}
