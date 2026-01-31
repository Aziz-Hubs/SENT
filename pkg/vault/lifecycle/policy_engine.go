package lifecycle

import (
	"context"
	"fmt"
	"log"
	"sent/ent"
	"sent/ent/predicate"
	"sent/ent/retentionpolicy"
	"sent/ent/vaultitem"
	"strings"
	"time"
)

// PolicyEngine manages document retention and lifecycle.
type PolicyEngine struct {
	db *ent.Client
}

// NewPolicyEngine creates a new policy engine.
func NewPolicyEngine(db *ent.Client) *PolicyEngine {
	return &PolicyEngine{db: db}
}

// RunRetentionCheck evaluates all documents against retention policies.
// This should be called periodically (e.g., daily via cron/River).
func (e *PolicyEngine) RunRetentionCheck(ctx context.Context) error {
	// Get all active retention policies
	policies, err := e.db.RetentionPolicy.Query().
		Where(retentionpolicy.Active(true)).
		All(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch retention policies: %w", err)
	}

	for _, policy := range policies {
		if err := e.applyPolicy(ctx, policy); err != nil {
			log.Printf("Error applying policy %s: %v", policy.Name, err)
		}
	}

	return nil
}

func (e *PolicyEngine) applyPolicy(ctx context.Context, policy *ent.RetentionPolicy) error {
	cutoffDate := time.Now().AddDate(0, 0, -policy.RetentionDays)

	// Build query for items matching this policy
	query := e.db.VaultItem.Query().
		Where(
			vaultitem.CreatedAtLT(cutoffDate),
			vaultitem.DeletedAtIsNil(), // Not already deleted
		)

	// Apply file type filter if specified
	if policy.FileTypeFilter != "" {
		extensions := strings.Split(policy.FileTypeFilter, ",")
		predicates := make([]predicate.VaultItem, len(extensions))
		for i, ext := range extensions {
			predicates[i] = vaultitem.NameHasSuffix("." + strings.TrimSpace(ext))
		}
		query = query.Where(vaultitem.Or(predicates...))
	}

	items, err := query.All(ctx)
	if err != nil {
		return err
	}

	for _, item := range items {
		// Check for legal hold
		hasHold, err := item.QueryLegalHolds().Exist(ctx)
		if err != nil {
			log.Printf("Error checking legal hold for %s: %v", item.Path, err)
			continue
		}
		if hasHold {
			log.Printf("Skipping %s due to active legal hold", item.Path)
			continue
		}

		switch policy.Action {
		case retentionpolicy.ActionArchive:
			// Move to archive folder (soft archive)
			now := time.Now()
			_, err = e.db.VaultItem.UpdateOne(item).
				SetPath(".archive/" + item.Path).
				SetUpdatedAt(now).
				Save(ctx)
		case retentionpolicy.ActionDelete:
			// Soft delete
			now := time.Now()
			_, err = e.db.VaultItem.UpdateOne(item).
				SetDeletedAt(now).
				Save(ctx)
		}

		if err != nil {
			log.Printf("Error applying %s to %s: %v", policy.Action, item.Path, err)
		} else {
			log.Printf("Applied %s to %s (policy: %s)", policy.Action, item.Path, policy.Name)
		}
	}

	return nil
}

// PermanentlyDeleteExpiredTrash removes items that have been in trash for more than 30 days.
func (e *PolicyEngine) PermanentlyDeleteExpiredTrash(ctx context.Context) error {
	cutoff := time.Now().AddDate(0, 0, -30)

	items, err := e.db.VaultItem.Query().
		Where(
			vaultitem.DeletedAtNotNil(),
			vaultitem.DeletedAtLT(cutoff),
		).
		All(ctx)
	if err != nil {
		return err
	}

	for _, item := range items {
		if err := e.db.VaultItem.DeleteOne(item).Exec(ctx); err != nil {
			log.Printf("Error permanently deleting %s: %v", item.Path, err)
		} else {
			log.Printf("Permanently deleted %s", item.Path)
		}
	}

	return nil
}
