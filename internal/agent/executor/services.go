package executor

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
)

// ServiceAction defines the type of service operation.
type ServiceAction string

const (
	ActionStart   ServiceAction = "start"
	ActionStop    ServiceAction = "stop"
	ActionRestart ServiceAction = "restart"
)

// HandleServiceAction executes a service control operation.
func HandleServiceAction(ctx context.Context, serviceName string, action ServiceAction) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		// Use PowerShell for reliable service control
		psAction := ""
		switch action {
		case ActionStart:
			psAction = "Start-Service"
		case ActionStop:
			psAction = "Stop-Service"
		case ActionRestart:
			psAction = "Restart-Service"
		}
		cmd = exec.CommandContext(ctx, "powershell", "-Command", fmt.Sprintf("%s -Name %s", psAction, serviceName))
	case "linux":
		// Use systemctl
		cmd = exec.CommandContext(ctx, "systemctl", string(action), serviceName)
	default:
		return fmt.Errorf("unsupported OS for service actions: %s", runtime.GOOS)
	}

	return cmd.Run()
}

// HandleKillProcess kills a process by PID.
func HandleKillProcess(ctx context.Context, pid int) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.CommandContext(ctx, "taskkill", "/F", "/PID", fmt.Sprintf("%d", pid))
	case "linux", "darwin":
		cmd = exec.CommandContext(ctx, "kill", "-9", fmt.Sprintf("%d", pid))
	default:
		return fmt.Errorf("unsupported OS for process killing: %s", runtime.GOOS)
	}

	return cmd.Run()
}
