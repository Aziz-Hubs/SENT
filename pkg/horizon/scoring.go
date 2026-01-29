package horizon

import (
	"context"
	"sent/ent"
	"sent/ent/asset"
	"sent/ent/tenant"
	"sent/ent/ticket"
	"time"
)

// ScoringWeights defines the percentage contribution of each category.
type ScoringWeights struct {
	Performance float64
	Security    float64
	Lifecycle   float64
}

// DefaultWeights as per architectural mandates.
var DefaultWeights = ScoringWeights{
	Performance: 0.40,
	Security:    0.40,
	Lifecycle:   0.20,
}

// ScoringEngine handles the calculation of vCIO health scores.
type ScoringEngine struct {
	db *ent.Client
}

// NewScoringEngine initializes the engine.
func NewScoringEngine(db *ent.Client) *ScoringEngine {
	return &ScoringEngine{db: db}
}

// CalculateTenantScore computes the 0-100 holistic health score for a tenant.
func (e *ScoringEngine) CalculateTenantScore(ctx context.Context, tenantID int) (*ent.HealthScoreSnapshot, error) {
	t, err := e.db.Tenant.Query().Where(tenant.ID(tenantID)).Only(ctx)
	if err != nil {
		return nil, err
	}

	// 1. Performance & Availability (40%)
	perfScore := e.calculatePerformanceScore(ctx, t)

	// 2. Security & Compliance (40%)
	secScore := e.calculateSecurityScore(ctx, t)

	// 3. Lifecycle & Operational (20%)
	lifeScore := e.calculateLifecycleScore(ctx, t)

	// Weighted Overall
	overall := (perfScore * DefaultWeights.Performance) +
		(secScore * DefaultWeights.Security) +
		(lifeScore * DefaultWeights.Lifecycle)

	// Save Snapshot
	snapshot, err := e.db.HealthScoreSnapshot.Create().
		SetTenant(t).
		SetOverallScore(overall).
		SetPerformanceScore(perfScore).
		SetSecurityScore(secScore).
		SetLifecycleScore(lifeScore).
		SetMetadata(map[string]interface{}{
			"weights": DefaultWeights,
			"calc_at": time.Now().Format(time.RFC3339),
		}).
		Save(ctx)

	return snapshot, err
}

func (e *ScoringEngine) calculatePerformanceScore(ctx context.Context, t *ent.Tenant) float64 {
	// Logic: Scale based on MTTR and Uptime.
	// Placeholder: In a real system, we query continuous aggregates from pulse_telemetry.
	// For now, we use Ticket resolution times as a proxy for MTTR.
	
	closedTickets, _ := e.db.Ticket.Query().
		Where(ticket.HasTenantWith(tenant.ID(t.ID)), ticket.StatusEQ(ticket.StatusClosed)).
		All(ctx)

	if len(closedTickets) == 0 {
		return 100.0 // Default to perfect if no incidents
	}

	var totalDuration float64
	count := 0
	for _, tk := range closedTickets {
		if tk.ResolvedAt != nil {
			duration := tk.ResolvedAt.Sub(tk.CreatedAt).Hours()
			totalDuration += duration
			count++
		}
	}

	if count == 0 { return 100.0 }
	avgMTTR := totalDuration / float64(count)

	// Perfect score if MTTR < 4 hours, linear drop to 0 if > 72 hours
	score := 100.0 - (avgMTTR * 1.3) 
	if score < 0 { score = 0 }
	return score
}

func (e *ScoringEngine) calculateSecurityScore(ctx context.Context, t *ent.Tenant) float64 {
	// Logic: Scale based on vulnerability counts from SENTprobe.
	// Placeholder: Mocking the aggregation of vulnerability data.
	
	// Assuming a baseline of 100, subtracting 10 points for each High/Critical alert.
	// In production, this queries the SENTprobe result tables.
	return 85.0 // Mock stable environment
}

func (e *ScoringEngine) calculateLifecycleScore(ctx context.Context, t *ent.Tenant) float64 {
	// Logic: Asset age and warranty status from SENTnexus.
	assets, _ := e.db.Asset.Query().
		Where(asset.HasTenantWith(tenant.ID(t.ID))).
		All(ctx)

	if len(assets) == 0 {
		return 100.0
	}

	underWarranty := 0
	for _, a := range assets {
		// Mock logic: if created < 3 years ago, consider healthy
		if time.Since(a.CreatedAt).Hours() < (24 * 365 * 3) {
			underWarranty++
		}
	}

	return (float64(underWarranty) / float64(len(assets))) * 100.0
}
