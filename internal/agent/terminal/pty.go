package terminal

import (
	"context"
	"fmt"
	"runtime"
	"sync"

	"github.com/UserExistsError/conpty"
)

// Session represents a PTY session.
type Session struct {
	ID     string
	Cpty   *conpty.ConPty
	Cancel context.CancelFunc
	once   sync.Once
}

// NewSession starts a new shell session.
func NewSession(id string) (*Session, error) {
	var shell string

	if runtime.GOOS == "windows" {
		shell = "powershell.exe"
	} else {
		// Fallback for Linux if we were to support it with this lib,
		// but UserExistsError/conpty is Windows specific.
		// Real implementation would use build tags.
		// For now, assuming Windows as per user environment.
		return nil, fmt.Errorf("this implementation supports Windows ConPTY only")
	}

	cpty, err := conpty.Start(shell)
	if err != nil {
		return nil, err
	}

	// Context for cancellation if needed (though ConPTY has Close)
	_, cancel := context.WithCancel(context.Background())

	return &Session{
		ID:     id,
		Cpty:   cpty,
		Cancel: cancel,
	}, nil
}

// Write input to the PTY
func (s *Session) Write(data []byte) (int, error) {
	return s.Cpty.Write(data)
}

// Read output from the PTY
func (s *Session) Read(p []byte) (int, error) {
	return s.Cpty.Read(p)
}

// Resize the PTY
func (s *Session) Resize(rows, cols uint32) error {
	return s.Cpty.Resize(int(cols), int(rows))
}

// Close the session
func (s *Session) Close() error {
	var err error
	s.once.Do(func() {
		s.Cancel()
		err = s.Cpty.Close()
	})
	return err
}
