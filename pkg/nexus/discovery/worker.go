package discovery

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/asset"
)

type Worker struct {
	db       *ent.Client
	nexusSvc *Service
}

func NewWorker(db *ent.Client) *Worker {
	return &Worker{
		db:       db,
		nexusSvc: NewService(db),
	}
}

// Run starts the background discovery and certification checker
func (w *Worker) Run(ctx context.Context) error {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	fmt.Println("[NEXUS] Discovery worker started.")

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := w.CheckCertifications(ctx); err != nil {
				fmt.Printf("[NEXUS] Certification check error: %v\n", err)
			}
		}
	}
}

// CheckCertifications identifies assets that need 90-day certification
func (w *Worker) CheckCertifications(ctx context.Context) error {
	ninetyDaysAgo := time.Now().AddDate(0, 0, -90)

	// Query assets that haven't been certified in 90 days
	assetsToCertify, err := w.db.Asset.Query().
		Where(
			asset.Or(
				asset.LastCertifiedAtIsNil(),
				asset.LastCertifiedAtLT(ninetyDaysAgo),
			),
		).
		WithOwner().
		All(ctx)

	if err != nil {
		return err
	}

	for _, a := range assetsToCertify {
		if a.Edges.Owner != nil {
			// Trigger certification task (In a real implementation, this would queue a River job
			// or create a 'Task' entity for the owner's Inbox).
			fmt.Printf("[NEXUS] Asset %s (ID: %d) needs certification by %s\n", a.Name, a.ID, a.Edges.Owner.Email)
			
			// For now, we update a flag or metadata to indicate pending certification
			// We can use the 'metadata' JSONB column for this.
			meta := a.Metadata
			if meta == nil {
				meta = make(map[string]interface{})
			}
			meta["certification_status"] = "pending"
			meta["certification_due"] = ninetyDaysAgo.AddDate(0, 0, 90).Format(time.RFC3339)

			_ = w.db.Asset.UpdateOne(a).
				SetMetadata(meta).
				Exec(ctx)
		}
	}

	return nil
}
