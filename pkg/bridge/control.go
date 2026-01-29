package bridge

import (
	"context"
	"sent/ent"
	"sent/ent/saasfilter"
	"sent/pkg/control"
	"sent/pkg/orchestrator"
)

type ControlBridge struct {
	ctx          context.Context
	db           *ent.Client
	central      *orchestrator.Orchestrator
	orchestrator *control.ControlOrchestrator
	discovery    *control.DiscoveryEngine
	finops       *control.FinOpsEngine
	engine       *control.ControlEngine
}

func NewControlBridge(db *ent.Client, orch *orchestrator.Orchestrator) *ControlBridge {
	return &ControlBridge{
		db:           db,
		central:      orch,
		orchestrator: control.NewControlOrchestrator(db, orch),
		discovery:    control.NewDiscoveryEngine(db),
		finops:       control.NewFinOpsEngine(db),
		engine:       control.NewControlEngine(db),
	}
}

// ... existing methods ...

func (b *ControlBridge) GetSNIRules(tenantID int) (map[string]string, error) {
	return b.engine.GetSNIRules(context.Background(), tenantID)
}

func (b *ControlBridge) AddSNIFilter(tenantID int, pattern string, action string) error {
	return b.db.SaaSFilter.Create().
		SetTenantID(tenantID).
		SetDomainPattern(pattern).
		SetAction(saasfilter.Action(action)).
		Exec(context.Background())
}

func (b *ControlBridge) Startup(ctx context.Context) {
	b.ctx = ctx
	// go b.orchestrator.Start(ctx) // Orchestrator is now started in main.go
}

func (b *ControlBridge) GetOrchestrator() *control.ControlOrchestrator {
	return b.orchestrator
}

// SaaS Management

func (b *ControlBridge) GetManagedApps() ([]*ent.SaaSApp, error) {
	return b.db.SaaSApp.Query().All(b.ctx)
}

func (b *ControlBridge) GetShadowApps() ([]*ent.SaaSApp, error) {
	return b.discovery.DiscoverShadowApps(b.ctx)
}

func (b *ControlBridge) GetDowngradeRecommendations(appID int) ([]control.DowngradeRecommendation, error) {
	return b.finops.AnalyzeUsage(b.ctx, appID)
}

// KillSwitch

func (b *ControlBridge) TriggerKillSwitch(userID int) error {
	if b.central.GetClient() == nil {
		return nil
	}
	_, err := b.central.GetClient().Insert(context.Background(), control.KillSwitchArgs{UserID: userID}, nil)
	return err
}
