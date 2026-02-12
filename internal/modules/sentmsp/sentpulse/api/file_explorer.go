package api

import (
	"context"
	"errors"
	"log"
	"sync"
	"time"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"connectrpc.com/connect"
)

// FileExplorerSession holds the active stream and response channels
type FileExplorerSession struct {
	DeviceID string
	Stream   *connect.BidiStream[sentpulsev1.FileExplorerMessage, sentpulsev1.FileExplorerMessage]

	// Map of RequestID to response channel
	pendingRequests map[string]chan *sentpulsev1.FileExplorerMessage
	mu              sync.Mutex
}

// FileSessionManager manages active file explorer sessions
type FileSessionManager struct {
	sessions map[string]*FileExplorerSession
	mu       sync.RWMutex
}

func NewFileSessionManager() *FileSessionManager {
	return &FileSessionManager{
		sessions: make(map[string]*FileExplorerSession),
	}
}

func (m *FileSessionManager) RegisterSession(deviceID string, stream *connect.BidiStream[sentpulsev1.FileExplorerMessage, sentpulsev1.FileExplorerMessage]) *FileExplorerSession {
	m.mu.Lock()
	defer m.mu.Unlock()

	session := &FileExplorerSession{
		DeviceID:        deviceID,
		Stream:          stream,
		pendingRequests: make(map[string]chan *sentpulsev1.FileExplorerMessage),
	}
	m.sessions[deviceID] = session
	log.Printf("File Explorer session registered for device %s", deviceID)
	return session
}

func (m *FileSessionManager) UnregisterSession(deviceID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if sess, ok := m.sessions[deviceID]; ok {
		sess.mu.Lock()
		// Close all pending channels to unblock waiters
		for _, ch := range sess.pendingRequests {
			close(ch)
		}
		sess.mu.Unlock()
		delete(m.sessions, deviceID)
		log.Printf("File Explorer session unregistered for device %s", deviceID)
	}
}

func (m *FileSessionManager) GetSession(deviceID string) (*FileExplorerSession, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	sess, ok := m.sessions[deviceID]
	return sess, ok
}

// SendRequest sends a request to the agent and waits for a response
func (s *FileExplorerSession) SendRequest(ctx context.Context, msg *sentpulsev1.FileExplorerMessage) (*sentpulsev1.FileExplorerMessage, error) {
	respChan := make(chan *sentpulsev1.FileExplorerMessage, 1)

	s.mu.Lock()
	s.pendingRequests[msg.RequestId] = respChan
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.pendingRequests, msg.RequestId)
		s.mu.Unlock()
	}()

	// Send to stream
	if err := s.Stream.Send(msg); err != nil {
		return nil, err
	}

	// Wait for response or timeout
	select {
	case resp, ok := <-respChan:
		if !ok {
			return nil, errors.New("session closed")
		}
		return resp, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-time.After(30 * time.Second):
		return nil, errors.New("timeout waiting for agent response")
	}
}

func (s *FileExplorerSession) HandleResponse(msg *sentpulsev1.FileExplorerMessage) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if ch, ok := s.pendingRequests[msg.RequestId]; ok {
		ch <- msg
	} else {
		log.Printf("Received response for unknown request ID: %s", msg.RequestId)
	}
}
