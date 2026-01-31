package agent

import (
	"os/exec"
	"runtime"
)

// RebootSystem restarts the machine
func RebootSystem() error {
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("shutdown", "/r", "/t", "0")
	} else {
		cmd = exec.Command("reboot")
	}
	return cmd.Run()
}

// ShutdownSystem shuts down the machine
func ShutdownSystem() error {
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("shutdown", "/s", "/t", "0")
	} else {
		cmd = exec.Command("shutdown", "-h", "now")
	}
	return cmd.Run()
}
