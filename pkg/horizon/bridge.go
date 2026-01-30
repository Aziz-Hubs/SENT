package horizon

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/strategicroadmap"
	"sent/ent/tenant"
	"sent/pkg/auth"
	"sent/pkg/vault"
	"time"

	"github.com/shopspring/decimal"
)

// ProjectDTO represents a simplified project for the frontend.
type ProjectDTO struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Priority      string  `json:"priority"`
	Status        string  `json:"status"`
	EstimatedCost float64 `json:"cost"`
	TargetDate    string  `json:"date"`
}

// HorizonBridge serves as the Wails binding interface.
type HorizonBridge struct {
	ctx       context.Context
	db        *ent.Client
	auth      *auth.AuthBridge
	scoring   *ScoringEngine
	forecast  *ForecastingEngine
	reporter  *ReportGenerator
}

// NewHorizonBridge initializes the bridge.
func NewHorizonBridge(db *ent.Client, auth *auth.AuthBridge, v *vault.VaultBridge) *HorizonBridge {
	return &HorizonBridge{
		db:       db,
		auth:     auth,
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
func (b *HorizonBridge) GetLatestHealthScore() (*ent.HealthScoreSnapshot, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	return b.scoring.CalculateTenantScore(b.ctx, profile.TenantID)
}

// GetBudgetForecast retrieves the refresh wall forecast.
func (b *HorizonBridge) GetBudgetForecast() ([]*ent.BudgetForecast, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	return b.forecast.GenerateForecast(b.ctx, profile.TenantID)
}

// GenerateQBR triggers the server-side PDF generation.
func (b *HorizonBridge) GenerateQBR(commentary string) (string, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	return b.reporter.GenerateQBR(b.ctx, profile.TenantID, commentary)
}

// GetRoadmap retrieves the strategic initiatives.
func (b *HorizonBridge) GetRoadmap() ([]ProjectDTO, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}

	items, err := b.db.StrategicRoadmap.Query().
		Where(strategicroadmap.HasTenantWith(tenant.ID(profile.TenantID))).
		Order(ent.Asc(strategicroadmap.FieldTargetDate)).
		All(b.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch roadmap: %w", err)
	}

	dtos := make([]ProjectDTO, len(items))
	for i, item := range items {
		dtos[i] = ProjectDTO{
			ID:            item.ID,
			Name:          item.ProjectName,
			Description:   item.Description,
			Priority:      string(item.Priority),
			Status:        string(item.Status),
			EstimatedCost: item.EstimatedCost.InexactFloat64(),
			TargetDate:    item.TargetDate.Format("January 2006"),
		}
	}

	return dtos, nil
}

// AddProject creates a new strategic roadmap item.
func (b *HorizonBridge) AddProject(name string, description string, priority string, cost float64, targetDate string) (int, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return 0, err
	}

	// Parse date (expecting ISO string from frontend)
	parsedDate, err := time.Parse(time.RFC3339, targetDate)
	if err != nil {
		// Try YYYY-MM-DD
		parsedDate, err = time.Parse("2006-01-02", targetDate)
		if err != nil {
			return 0, fmt.Errorf("invalid date format: %w", err)
		}
	}

	item, err := b.db.StrategicRoadmap.Create().
		SetTenantID(profile.TenantID).
		SetProjectName(name).
		SetDescription(description).
		SetPriority(strategicroadmap.Priority(priority)).
		SetEstimatedCost(decimal.NewFromFloat(cost)).
		SetTargetDate(parsedDate).
		SetStatus(strategicroadmap.StatusPLANNED).
		Save(b.ctx)

	if err != nil {
		return 0, fmt.Errorf("failed to create project: %w", err)
	}

	return item.ID, nil
}
