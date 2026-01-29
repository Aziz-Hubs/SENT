package control

import (
	"context"
	"sent/ent"
	"sent/ent/saasapp"
)

type DiscoveryEngine struct {
	db *ent.Client
}

func NewDiscoveryEngine(db *ent.Client) *DiscoveryEngine {
	return &DiscoveryEngine{db: db}
}

// DiscoverShadowApps correlates financial data with network logs.
func (e *DiscoveryEngine) DiscoverShadowApps(ctx context.Context) ([]*ent.SaaSApp, error) {
	// 1. Get unmanaged spend from SENTcapital
	// 2. Cross-reference with SENTgrid SNI logs
	// 3. Filter existing managed apps
	
	// Placeholder logic
	return e.db.SaaSApp.Query().
		Where(saasapp.IsManaged(false)).
		All(ctx)
}

// SuggestToNexus feeds discovered apps as AssetSuggestions.
func (e *DiscoveryEngine) SuggestToNexus(ctx context.Context, appID int) error {
	// TODO: Create AssetSuggestion in SENTnexus
	return nil
}
