package agent

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"

	"github.com/creack/pty"
)

// TerminalSession manages a PTY session
type TerminalSession struct {
	Pty    *os.File
	Cmd    *exec.Cmd
	Output io.ReadCloser
	Input  io.WriteCloser
}

// StartTerminal spawns a shell in a PTY
func StartTerminal(cols, rows int) (*TerminalSession, error) {
	var shell string
	if runtime.GOOS == "windows" {
		shell = "powershell.exe"
	} else {
		shell = "/bin/bash"
	}

	c := exec.Command(shell)

	// Create PTY
	ptmx, err := pty.StartWithSize(c, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to start pty: %w", err)
	}

	return &TerminalSession{
		Pty:    ptmx,
		Cmd:    c,
		Output: ptmx,
		Input:  ptmx,
	}, nil
}

// Resize resizes the PTY
func (ts *TerminalSession) Resize(cols, rows int) error {
	return pty.Setsize(ts.Pty, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
}

// Close kills the session
func (ts *TerminalSession) Close() error {
	if ts.Cmd != nil && ts.Cmd.Process != nil {
		_ = ts.Cmd.Process.Kill()
	}
	if ts.Pty != nil {
		return ts.Pty.Close()
	}
	return nil
}
