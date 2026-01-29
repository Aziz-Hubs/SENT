package bridge

import (
	"context"
	"encoding/json"
	"fmt"
	"sent/pkg/orchestrator"

	"github.com/centrifugal/centrifuge-go"
)

type SecurityAuditBridge struct {
	client *centrifuge.Client
}

func NewSecurityAuditBridge() *SecurityAuditBridge {
	// Note: In a real system, the URL would be configurable
	c := centrifuge.NewJsonClient("ws://localhost:8000/connection/websocket", centrifuge.Config{})
	
	if err := c.Connect(); err != nil {
		fmt.Printf("[SECURITY] Warning: Failed to connect to Centrifugo: %v\n", err)
	}

	return &SecurityAuditBridge{client: c}
}

func (b *SecurityAuditBridge) EmitEvent(evt orchestrator.SecurityAuditEvent) error {
	if b.client == nil {
		return fmt.Errorf("signaling client not connected")
	}

	data, err := json.Marshal(evt)
	if err != nil {
		return err
	}

	// Publish to internal audit channel
	_, err = b.client.Publish(context.Background(), "security.audit.event", data)
	return err
}
