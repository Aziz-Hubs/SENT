package horizon

import (
	"context"
	"sent/ent"
	"sent/pkg/vault"
)

// HorizonBridge serves as the Wails binding interface.
type HorizonBridge struct {
	ctx       context.Context
	db        *ent.Client
	scoring   *ScoringEngine
	forecast  *ForecastingEngine
	reporter  *ReportGenerator
}

// NewHorizonBridge initializes the bridge.
func NewHorizonBridge(db *ent.Client, v *vault.VaultBridge) *HorizonBridge {
	return &HorizonBridge{
		db:       db,
		scoring:  NewScoringEngine(db),
		forecast: NewForecastingEngine(db),
		reporter: NewReportGenerator(db, v),
	}
}

// Startup initializes the context.
func (b *HorizonBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// GetLatestHealthScore retrieves or calculates the current health score.
func (b *HorizonBridge) GetLatestHealthScore(tenantID int) (*ent.HealthScoreSnapshot, error) {
	return b.scoring.CalculateTenantScore(b.ctx, tenantID)
}

// GetBudgetForecast retrieves the refresh wall forecast.
func (b *HorizonBridge) GetBudgetForecast(tenantID int) ([]*ent.BudgetForecast, error) {
	return b.forecast.GenerateForecast(b.ctx, tenantID)
}

// GenerateQBR triggers the server-side PDF generation.
func (b *HorizonBridge) GenerateQBR(tenantID int, commentary string) (string, error) {
	return b.reporter.GenerateQBR(b.ctx, tenantID, commentary)
}

// GetRoadmap retrieves the strategic initiatives.
func (b *HorizonBridge) GetRoadmap(tenantID int) ([]*ent.StrategicRoadmap, error) {
	return b.db.StrategicRoadmap.Query().All(b.ctx)
}
