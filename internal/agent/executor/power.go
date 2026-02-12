package executor

import (
	"context"
	"fmt"
	"log"
	"os/exec"
	"runtime"
)

// PowerAction defines the type of power operation
type PowerAction string

const (
	ActionReboot   PowerAction = "reboot"
	ActionShutdown PowerAction = "shutdown"
)

// HandlePowerAction executes a system reboot or shutdown.
// SAFETY: If dryRun is true, it only logs the command it WOULD have run.
func HandlePowerAction(ctx context.Context, action PowerAction, dryRun bool) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		flag := "/s" // shutdown
		if action == ActionReboot {
			flag = "/r"
		}
		// /t 60 gives a 60-second delay to allow cancel if needed, /f forces close apps
		cmd = exec.CommandContext(ctx, "shutdown", flag, "/f", "/t", "60", "/c", "SENTpulse Remote Power Action Requested")
	case "linux", "darwin":
		if action == ActionReboot {
			cmd = exec.CommandContext(ctx, "reboot")
		} else {
			cmd = exec.CommandContext(ctx, "shutdown", "-h", "now")
		}
	default:
		return fmt.Errorf("unsupported OS for power actions: %s", runtime.GOOS)
	}

	if dryRun {
		log.Printf("[DRY RUN] Would execute power action: %s (Command: %v)", action, cmd.Args)
		return nil
	}

	log.Printf("EXECUTING SYSTEM %s", action)
	return cmd.Run()
}
