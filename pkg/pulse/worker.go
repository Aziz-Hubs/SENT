package pulse

import (
	"context"
	"encoding/json"
	"log"
	"sent/pkg/pulse/common"

	"github.com/centrifugal/centrifuge-go"
)

// PulseWorker listens to Centrifugo channels and ingests data into TimescaleDB.
type PulseWorker struct {
	manager *PulseManager
	client  *centrifuge.Client
}

func NewPulseWorker(manager *PulseManager) *PulseWorker {
	// The worker itself can be a Centrifugo client that subscribes to all telemetry.
	// In Centrifugo, we can use a server-side subscription or a special admin client.
	// For this MVP, we'll use a client that subscribes to 'pulse:telemetry:*' 
	// (Note: Centrifugo requires specific configuration for wildcards or pattern subs).
	
	c := centrifuge.NewJsonClient("ws://localhost:8000/connection/websocket", centrifuge.Config{
		// Workers might need a special administrative token
		Token: "worker-token", 
	})

	return &PulseWorker{
		manager: manager,
		client:  c,
	}
}

func (w *PulseWorker) Start(ctx context.Context) error {
	if err := w.client.Connect(); err != nil {
		return err
	}

	// For MVP, let's assume we subscribe to a global telemetry stream
	// or individual agent streams as they register.
	// Centrifugo "channels" are the way.
	
	sub, err := w.client.NewSubscription("pulse:telemetry")
	if err != nil {
		return err
	}

	sub.OnPublication(func(e centrifuge.PublicationEvent) {
		var m common.SystemMetrics
		if err := json.Unmarshal(e.Data, &m); err != nil {
			log.Printf("[WORKER] Failed to unmarshal telemetry: %v", err)
			return
		}
		
		// In a real scenario, the agentID should be in the metadata or the data itself.
		// For now, let's assume it's passed or we extract from channel name.
		// agentID := extractAgentID(e.Channel)
		
		log.Printf("[WORKER] Received telemetry from Centrifugo")
		// w.manager.IngestBatch(agentID, []*common.SystemMetrics{&m})
	})

	return sub.Subscribe()
}

// PublishCommand sends a command to a specific agent channel.
func (w *PulseWorker) PublishCommand(agentID string, cmd string) error {
	// Channel format: pulse:control:<agentID>
	channel := "pulse:control:" + agentID
	_, err := w.client.Publish(context.Background(), channel, []byte(cmd))
	return err
}
