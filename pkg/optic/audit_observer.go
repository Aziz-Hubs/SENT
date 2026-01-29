package optic

import (
	"context"
	"encoding/json"
	"fmt"

	"sent/ent"
	"sent/pkg/orchestrator"
	"github.com/centrifugal/centrifuge-go"
)

type AuditObserver struct {
	db      *ent.Client
	storage *StorageManager
	client  *centrifuge.Client
}

func NewAuditObserver(db *ent.Client, storage *StorageManager) *AuditObserver {
	c := centrifuge.NewJsonClient("ws://localhost:8000/connection/websocket", centrifuge.Config{})
	return &AuditObserver{
		db:      db,
		storage: storage,
		client:  c,
	}
}

func (o *AuditObserver) Run(ctx context.Context) error {
	if err := o.client.Connect(); err != nil {
		return fmt.Errorf("failed to connect to centrifuge: %w", err)
	}

	sub, err := o.client.NewSubscription("security.audit.event")
	if err != nil {
		return err
	}

	sub.OnPublication(func(e centrifuge.PublicationEvent) {
		var evt orchestrator.SecurityAuditEvent
		if err := json.Unmarshal(e.Data, &evt); err != nil {
			fmt.Printf("[OPTIC] Failed to unmarshal audit event: %v\n", err)
			return
		}

		fmt.Printf("[OPTIC] Received Security Audit Event: %s from Kiosk %d\n", evt.Type, evt.KioskID)
		o.captureForensicClip(ctx, evt)
	})

	return sub.Subscribe()
}

func (o *AuditObserver) captureForensicClip(ctx context.Context, evt orchestrator.SecurityAuditEvent) {
	// 1. Identify camera mapped to KioskID
	// For now, assume Camera ID 1 is mapped to Kiosk 1
	cameraID := 1 

	// 2. Trigger ForensicClip capture (30s pre + 30s post)
	fmt.Printf("[OPTIC] Triggering Forensic Clip for Camera %d (Event Time: %d)\n", cameraID, evt.Timestamp)
	
	// Implementation would involve reading from a ring buffer of segments
	// and concatenating them using FFmpeg or similar.
	
	// Mock: Link a 'recording' to the event if it were a transaction
	// In this objective, we need to link it to the Kiosk transaction record.
	// Note: 'no_sale' might not have a transaction record yet or at all.
}
