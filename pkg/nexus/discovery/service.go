package discovery

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/asset"
	"sent/ent/discoveryentry"
)

type Service struct {
	client *ent.Client
}

func NewService(client *ent.Client) *Service {
	return &Service{client: client}
}

// TelemetryData represents the data coming from SENTpulse for discovery reconciliation
type TelemetryData struct {
	TenantID   int
	Hostname   string
	IP         string
	MAC        string
	OS         string
	Metadata   map[string]interface{}
}

// Reconcile matches incoming telemetry against the existing asset graph
func (s *Service) Reconcile(ctx context.Context, data TelemetryData) error {
	// 1. Try to find existing asset by hardware_id (using MAC as hardware_id for now)
	existing, err := s.client.Asset.Query().
		Where(asset.HardwareIDEQ(data.MAC)).
		Only(ctx)

	if err == nil {
		// Asset exists, update metadata and timestamp
		return s.client.Asset.UpdateOne(existing).
			SetName(data.Hostname).
			SetMetadata(data.Metadata).
			SetUpdatedAt(time.Now()).
			Exec(ctx)
	}

	if !ent.IsNotFound(err) {
		return fmt.Errorf("failed to query asset: %w", err)
	}

	// 2. Not found in Asset, check DiscoveryEntry (Approval Queue)
	pending, err := s.client.DiscoveryEntry.Query().
		Where(discoveryentry.HardwareIDEQ(data.MAC)).
		Only(ctx)

	if err == nil {
		// Already in queue, update metadata but keep pending status
		return s.client.DiscoveryEntry.UpdateOne(pending).
			SetName(data.Hostname).
			SetMetadata(data.Metadata).
			Exec(ctx)
	}

	if !ent.IsNotFound(err) {
		return fmt.Errorf("failed to query discovery entry: %w", err)
	}

	// 3. New Asset detected, trigger Approval Inbox workflow
	_, err = s.client.DiscoveryEntry.Create().
		SetTenantID(data.TenantID).
		SetHardwareID(data.MAC).
		SetName(data.Hostname).
		SetType(data.OS).
		SetMetadata(data.Metadata).
		SetStatus(discoveryentry.StatusPending).
		Save(ctx)

	return err
}

// ApproveDiscovery creates a real Asset from a DiscoveryEntry
func (s *Service) ApproveDiscovery(ctx context.Context, entryID int, assetTypeID int) (*ent.Asset, error) {
	entry, err := s.client.DiscoveryEntry.Get(ctx, entryID)
	if err != nil {
		return nil, err
	}

	// Create the Asset
	newAsset, err := s.client.Asset.Create().
		SetTenantID(entry.Edges.Tenant.ID).
		SetTypeID(assetTypeID).
		SetHardwareID(entry.HardwareID).
		SetName(entry.Name).
		SetMetadata(entry.Metadata).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	// Delete/Update entry status
	err = s.client.DiscoveryEntry.UpdateOne(entry).
		SetStatus(discoveryentry.StatusApproved).
		Exec(ctx)

	return newAsset, err
}
