package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sent/internal/divisions/msp/pulse/common"

	"github.com/centrifugal/centrifuge-go"
)

type PulseClient struct {
	client  *centrifuge.Client
	agentID string
}

func NewPulseClient(wsURL string, agentID string, token string) *PulseClient {
	c := centrifuge.NewJsonClient(wsURL, centrifuge.Config{
		Token: token,
	})

	return &PulseClient{
		client:  c,
		agentID: agentID,
	}
}

func (pc *PulseClient) Connect() error {
	err := pc.client.Connect()
	if err != nil {
		return err
	}
	log.Printf("[AGENT] Connected to Centrifugo as %s", pc.agentID)
	return nil
}

func (pc *PulseClient) PublishTelemetry(metrics *common.SystemMetrics) error {
	data, err := json.Marshal(metrics)
	if err != nil {
		return err
	}

	channel := fmt.Sprintf("pulse:telemetry:%s", pc.agentID)
	_, err = pc.client.Publish(context.Background(), channel, data)
	return err
}

func (pc *PulseClient) SubscribeControl(handler func(cmd string)) error {
	channel := fmt.Sprintf("pulse:control:%s", pc.agentID)
	sub, err := pc.client.NewSubscription(channel)
	if err != nil {
		return err
	}

	sub.OnPublication(func(e centrifuge.PublicationEvent) {
		handler(string(e.Data))
	})

	return sub.Subscribe()
}

func (pc *PulseClient) Close() error {
	return pc.client.Disconnect()
}
