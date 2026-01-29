package ivr

import (
	"context"
	"fmt"

	"sent/ent"
	"sent/ent/ivrflow"
)

// Engine interprets IVR DAGs and routes calls.
type Engine struct {
	client *ent.Client
}

// NewEngine initializes a new IVR Engine.
func NewEngine(client *ent.Client) *Engine {
	return &Engine{client: client}
}

// RouteCall processes an incoming call through an IVR flow.
func (e *Engine) RouteCall(ctx context.Context, flowID int, input string) (string, error) {
	flow, err := e.client.IVRFlow.Query().
		Where(ivrflow.IDEQ(flowID)).
		Only(ctx)
	if err != nil {
		return "", fmt.Errorf("ivr flow not found: %w", err)
	}

	_ = flow

	// Logic to traverse nodes and edges based on input
	// For now, returning a mock destination
	return "ext-101", nil
}

// ProcessNode handles individual IVR node logic (e.g., play audio, wait for DTMF).
func (e *Engine) ProcessNode(nodeID string, flow *ent.IVRFlow) error {
	// Node processing logic
	return nil
}
