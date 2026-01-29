package nexus

import (
	"context"
	"time"

	"sent/ent"
	"sent/pkg/nexus/discovery"
	"sent/pkg/nexus/impact"
	"sent/pkg/nexus/sop"
	"sent/pkg/nexus/vault"
)

type NexusBridge struct {
	ctx      context.Context
	db       *ent.Client
	vault    *vault.Service
	discover *discovery.Service
	impact   *impact.Engine
	sop      *sop.Service
}

func NewNexusBridge(db *ent.Client) *NexusBridge {
	return &NexusBridge{
		db:       db,
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
	return b.db.DiscoveryEntry.Query().WithTenant().All(b.ctx)
}

func (b *NexusBridge) ApproveAsset(entryID int, assetTypeID int) (*ent.Asset, error) {
	return b.discover.ApproveDiscovery(context.Background(), entryID, assetTypeID)
}

// Asset Graph

func (b *NexusBridge) GetAssetGraph() ([]*ent.Asset, error) {
	return b.db.Asset.Query().
					WithType().
					WithHostedAssets().
					WithDependsOn().		All(b.ctx)
}
