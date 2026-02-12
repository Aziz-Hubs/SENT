package api

import (
	"sync"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
)

// TerminalSession holds the channels for a bridge between Agent and Frontend.
type TerminalSession struct {
	SessionID string
	// Agent -> Frontend (Output from terminal)
	OutputChan chan *sentpulsev1.TerminalOutput
	// Frontend -> Agent (Input to terminal)
	InputChan chan *sentpulsev1.TerminalInput

	// Signal to close
	Done chan struct{}
}

type SessionManager struct {
	mu       sync.RWMutex
	sessions map[string]*TerminalSession
}

var GlobalSessionManager = &SessionManager{
	sessions: make(map[string]*TerminalSession),
}

func (sm *SessionManager) GetSession(id string) *TerminalSession {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.sessions[id]
}

func (sm *SessionManager) CreateSession(id string) *TerminalSession {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	// If exists, return existing (or close old one? For now reuse)
	if s, ok := sm.sessions[id]; ok {
		return s
	}

	s := &TerminalSession{
		SessionID:  id,
		OutputChan: make(chan *sentpulsev1.TerminalOutput, 100),
		InputChan:  make(chan *sentpulsev1.TerminalInput, 100),
		Done:       make(chan struct{}),
	}
	sm.sessions[id] = s
	return s
}

func (sm *SessionManager) RemoveSession(id string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	if s, ok := sm.sessions[id]; ok {
		close(s.Done)
		delete(sm.sessions, id)
	}
}
