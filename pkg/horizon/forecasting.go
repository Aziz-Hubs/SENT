package horizon

import (
	"context"
	"math"
	"sent/ent"
	"github.com/shopspring/decimal"
)

// LinearRegression predicts Y given X using a simple model.
func LinearRegression(x []float64, y []float64) (slope, intercept float64) {
	n := float64(len(x))
	var sumX, sumY, sumXX, sumXY float64
	for i := 0; i < len(x); i++ {
		sumX += x[i]
		sumY += y[i]
		sumXX += x[i] * x[i]
		sumXY += x[i] * y[i]
	}
	slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX)
	intercept = (sumY - slope*sumX) / n
	return
}

// ForecastingEngine predicts the "Budget Wall" for hardware refreshes.
type ForecastingEngine struct {
	db *ent.Client
}

// NewForecastingEngine initializes the engine.
func NewForecastingEngine(db *ent.Client) *ForecastingEngine {
	return &ForecastingEngine{db: db}
}

// GenerateForecast predicts spending for the next 12 months.
func (e *ForecastingEngine) GenerateForecast(ctx context.Context, tenantID int) ([]*ent.BudgetForecast, error) {
	// Query historical spending from SENTcapital
	// For this prototype, we simulate historical data points.
	historyX := []float64{1, 2, 3, 4, 5, 6} // months ago
	historyY := []float64{1200, 1500, 1100, 1800, 2000, 1600} // spending

	slope, intercept := LinearRegression(historyX, historyY)

	var forecasts []*ent.BudgetForecast
	t, _ := e.db.Tenant.Get(ctx, tenantID)

	for i := 1; i <= 12; i++ {
		monthX := 6.0 + float64(i)
		projected := slope*monthX + intercept
		
		// Add "Wall" spikes if many assets hit 5-year EOL
		// This would query SENTnexus asset metadata in production.
		if i == 6 { projected += 5000 } // Simulate major server refresh

		f, _ := e.db.BudgetForecast.Create().
			SetTenant(t).
			SetYear(2026).
			SetMonth(i).
			SetProjectedAmount(decimal.NewFromFloat(math.Max(projected, 0))).
			Save(ctx)
		
		forecasts = append(forecasts, f)
	}

	return forecasts, nil
}
