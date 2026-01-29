package bridge

import (
	"context"
	"sent/ent"
	"sent/pkg/pulse"
)

type PulseBridge struct {
	ctx     context.Context
	db      *ent.Client
	manager *pulse.PulseManager
	worker  *pulse.PulseWorker
}

func NewPulseBridge(db *ent.Client) *PulseBridge {
	// For MVP, we pass nil for river client if not easily available in bridge layer.
	// In production, this should be initialized in main and passed down.
	manager := pulse.NewPulseManager(db, nil)
	worker := pulse.NewPulseWorker(manager)
	
	return &PulseBridge{
		db:      db,
		manager: manager,
		worker:  worker,
	}
}

func (b *PulseBridge) Startup(ctx context.Context) {
	b.ctx = ctx
	// Start the ingestion worker in the background
	go b.worker.Start(ctx)
}

// GetAgents returns a list of registered agents.
func (b *PulseBridge) GetAgents() ([]*ent.Agent, error) {
	return b.db.Agent.Query().All(b.ctx)
}

// SendCommand sends a remote command to an agent.
func (b *PulseBridge) SendCommand(agentID string, cmd string) error {
	// TODO: Publish to Centrifugo pulse:control:agentID
	return nil
}