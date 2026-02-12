package executor

import (
	"context"
	"os/exec"
	"runtime"
	"time"
)

// JobResult holds the output of an executed job.
type JobResult struct {
	JobID      string
	ExitCode   int
	Stdout     string
	Stderr     string
	FinishedAt time.Time
}

// Execute runs a shell command based on the OS.
func Execute(ctx context.Context, jobID, command, language string) (*JobResult, error) {
	var cmd *exec.Cmd

	// Determine shell based on OS and requested language
	if runtime.GOOS == "windows" {
		if language == "bash" {
			// Try to use WSL or Git Bash if specifically requested, otherwise fallback to PowerShell
			// For MVP, we'll stick to PowerShell for Windows
			cmd = exec.CommandContext(ctx, "powershell", "-Command", command)
		} else {
			// Default to PowerShell
			cmd = exec.CommandContext(ctx, "powershell", "-Command", command)
		}
	} else {
		// Linux/MacOS
		shell := "/bin/sh"
		if language == "bash" {
			shell = "/bin/bash"
		}
		cmd = exec.CommandContext(ctx, shell, "-c", command)
	}

	// Execute
	output, err := cmd.CombinedOutput()

	result := &JobResult{
		JobID:      jobID,
		FinishedAt: time.Now(),
		Stdout:     string(output),
	}

	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			result.ExitCode = exitError.ExitCode()
		} else {
			result.ExitCode = 1
			result.Stderr = err.Error()
		}
	} else {
		result.ExitCode = 0
	}

	// Simple heuristic to split stdout/stderr if we used CombinedOutput
	// Ideally we'd capture them separately, but for MVP Combined is often enough
	// If needed, we can refactor later.

	return result, nil
}
