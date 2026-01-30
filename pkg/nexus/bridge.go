package nexus

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/asset"
	"sent/ent/assettype"
	"sent/ent/discoveryentry"
	"sent/ent/saasapp"
	"sent/ent/tenant"
	"sent/pkg/auth"
	"sent/pkg/nexus/discovery"
	"sent/pkg/nexus/impact"
	"sent/pkg/nexus/sop"
	"sent/pkg/nexus/vault"
)

type NexusBridge struct {
	ctx      context.Context
	db       *ent.Client
	auth     *auth.AuthBridge
	vault    *vault.Service
	discover *discovery.Service
	impact   *impact.Engine
	sop      *sop.Service
}

func NewNexusBridge(db *ent.Client, auth *auth.AuthBridge) *NexusBridge {
	return &NexusBridge{
		db:       db,
		auth:     auth,
		vault:    vault.NewService(db),
		discover: discovery.NewService(db),
		impact:   impact.NewEngine(db),
		sop:      sop.NewService(db),
	}
}

func (b *NexusBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// Vault Actions

func (b *NexusBridge) RevealCredential(req vault.RevealRequest) (string, error) {
	return b.vault.Reveal(context.Background(), req)
}

func (b *NexusBridge) CopyCredential(req vault.RevealRequest) error {
	return b.vault.CopyToClipboard(context.Background(), b.ctx, req)
}

func (b *NexusBridge) CreateOneTimeLink(tenantID int, credID int, durationMinutes int) (string, error) {
	return b.vault.CreateOneTimeLink(context.Background(), tenantID, credID, time.Duration(durationMinutes)*time.Minute)
}

func (b *NexusBridge) ConsumeOneTimeLink(token string) (string, error) {
	return b.vault.ConsumeOneTimeLink(context.Background(), token)
}

// SOP Actions

func (b *NexusBridge) CreateSOP(tenantID int, authorID int, title string, content map[string]interface{}, assetID *int) (*ent.SOP, error) {
	return b.sop.CreateSOP(context.Background(), tenantID, authorID, title, content, assetID)
}

func (b *NexusBridge) UpdateSOP(id int, title string, content map[string]interface{}) (*ent.SOP, error) {
	return b.sop.UpdateSOP(context.Background(), id, title, content)
}

func (b *NexusBridge) GetSOPsByAsset(assetID int) ([]*ent.SOP, error) {
	return b.sop.GetByAsset(context.Background(), assetID)
}

// Impact Analysis

func (b *NexusBridge) GetBlastRadius(assetID int, depth int) ([]impact.ImpactNode, error) {
	return b.impact.CalculateBlastRadius(context.Background(), assetID, depth)
}

// Discovery Actions

func (b *NexusBridge) GetPendingDiscovery() ([]*ent.DiscoveryEntry, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	return b.db.DiscoveryEntry.Query().
		Where(discoveryentry.HasTenantWith(tenant.ID(profile.TenantID))).
		All(b.ctx)
}

func (b *NexusBridge) ApproveAsset(entryID int, assetTypeID int) (*ent.Asset, error) {
	return b.discover.ApproveDiscovery(context.Background(), entryID, assetTypeID)
}

// Asset Actions

func (b *NexusBridge) GetAssetGraph() ([]*ent.Asset, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	return b.db.Asset.Query().
		Where(asset.HasTenantWith(tenant.ID(profile.TenantID))).
		WithType().
		WithHostedAssets().
		WithDependsOn().
		All(b.ctx)
}

func (b *NexusBridge) CreateAsset(name string, typeName string, ip string, location string) (*ent.Asset, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	// 1. Find or create asset type
	t, err := b.db.AssetType.Query().Where(assettype.NameEqualFold(typeName)).Only(b.ctx)
	if err != nil {
		t, err = b.db.AssetType.Create().SetName(typeName).Save(b.ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to ensure asset type: %w", err)
		}
	}

	// 2. Create the asset
	return b.db.Asset.Create().
		SetTenantID(profile.TenantID).
		SetName(name).
		SetType(t).
		SetMetadata(map[string]interface{}{
			"ip_address": ip,
			"location":   location,
			"manual_intake": true,
		}).
		Save(b.ctx)
}

func (b *NexusBridge) ImportAssets(jsonBlob string) (int, error) {
	// TODO: Implement actual parser for CSV/JSON and bulk insert
	fmt.Printf("[NEXUS] Bulk import requested: %d bytes\n", len(jsonBlob))
	return 0, nil
}

// SaaS Audit Actions (B4)

func (b *NexusBridge) GetSaaSInventory() ([]*ent.SaaSApp, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	return b.db.SaaSApp.Query().
		Where(saasapp.HasTenantWith(tenant.ID(profile.TenantID))).
		All(b.ctx)
}

func (b *NexusBridge) ScanShadowIT() (int, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}

	// Simulated list of SaaS apps found in network logs or invoices
	discovered := []struct {
		Name     string
		Provider string
		Category string
	}{
		{"Dropbox Personal", "Dropbox", "Storage"},
		{"Free CRM", "HubSpot", "Sales"},
		{"Project Alpha", "Asana", "Collaboration"},
		{"Shadow Backup", "Backblaze", "Infrastructure"},
	}

	foundCount := 0
	for _, devApp := range discovered {
		// Check if this app is already in our inventory
		exists, err := b.db.SaaSApp.Query().
			Where(
				saasapp.NameEqualFold(devApp.Name),
				saasapp.HasTenantWith(tenant.ID(profile.TenantID)),
			).
			Exist(b.ctx)

		if err != nil {
			continue
		}

		if !exists {
			// Trigger a discovery entry or create as unmanaged
			_, err = b.db.SaaSApp.Create().
				SetTenantID(profile.TenantID).
				SetName(devApp.Name).
				SetProvider(devApp.Provider).
				SetCategory(devApp.Category).
				SetIsManaged(false).
				Save(b.ctx)
			if err == nil {
				foundCount++
			}
		}
	}

	return foundCount, nil
}
