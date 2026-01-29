package rtc

import (
	"fmt"
	"sync"

	"github.com/pion/webrtc/v4"
)

// Engine manages WebRTC peer connections and media tracks.
type Engine struct {
	config webrtc.Configuration
	api    *webrtc.API
	mu     sync.Mutex
	pcs    map[string]*webrtc.PeerConnection
}

// NewEngine initializes a new RTC Engine.
func NewEngine() *Engine {
	// Standard ICE servers (can be overridden via config)
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// Create a new API with default settings
	s := webrtc.SettingEngine{}
	api := webrtc.NewAPI(webrtc.WithSettingEngine(s))

	return &Engine{
		config: config,
		api:    api,
		pcs:    make(map[string]*webrtc.PeerConnection),
	}
}

// CreatePeerConnection creates and tracks a new RTCPeerConnection.
func (e *Engine) CreatePeerConnection(id string) (*webrtc.PeerConnection, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	pc, err := e.api.NewPeerConnection(e.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create peer connection: %w", err)
	}

	e.pcs[id] = pc

	pc.OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
		if state == webrtc.PeerConnectionStateDisconnected || state == webrtc.PeerConnectionStateClosed {
			e.mu.Lock()
			delete(e.pcs, id)
			e.mu.Unlock()
		}
	})

	return pc, nil
}

// ClosePeerConnection closes and removes a peer connection.
func (e *Engine) ClosePeerConnection(id string) error {
	e.mu.Lock()
	pc, ok := e.pcs[id]
	e.mu.Unlock()

	if !ok {
		return nil
	}

	return pc.Close()
}
