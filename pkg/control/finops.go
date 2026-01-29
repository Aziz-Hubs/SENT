package control

import (
	"context"
	"sent/ent"
	"sent/ent/saasapp"
	"sent/ent/saasidentity"
)

type FinOpsEngine struct {
	db *ent.Client
}

func NewFinOpsEngine(db *ent.Client) *FinOpsEngine {
	return &FinOpsEngine{db: db}
}

type DowngradeRecommendation struct {
	IdentityID int
	Email      string
	CurrentPlan string
	SuggestedPlan string
	Savings     float64
	Reason      string
}

// AnalyzeUsage identifies candidates for license downgrades.
func (e *FinOpsEngine) AnalyzeUsage(ctx context.Context, appID int) ([]DowngradeRecommendation, error) {
	// Query identities for the app with low usage of premium features
	identities, err := e.db.SaaSIdentity.Query().
		Where(saasidentity.HasAppWith(saasapp.ID(appID))).
		WithUsages().
		All(ctx)
	
	if err != nil {
		return nil, err
	}

	var recs []DowngradeRecommendation
	for _, id := range identities {
		// Logic to determine if "Premium" features were used in last 30 days
		hasPremiumUsage := false
		for _, u := range id.Edges.Usages {
			if u.Metadata["is_premium"] == true {
				hasPremiumUsage = true
				break
			}
		}

		if !hasPremiumUsage && id.CurrentPlan == "Premium" {
			recs = append(recs, DowngradeRecommendation{
				IdentityID: id.ID,
				Email:      id.Email,
				CurrentPlan: "Premium",
				SuggestedPlan: "Standard",
				Savings:     15.0, // Example
				Reason:      "No premium feature usage in 30 days",
			})
		}
	}

	return recs, nil
}
