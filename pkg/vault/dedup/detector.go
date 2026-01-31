package dedup

import (
	"context"
	"sent/ent"
	"sent/ent/vaultitem"
)

// DuplicateGroup represents a group of files with the same hash.
type DuplicateGroup struct {
	Hash  string
	Items []*ent.VaultItem
	Count int
}

// Detector finds duplicate files based on content hash.
type Detector struct {
	db *ent.Client
}

// NewDetector creates a new duplicate detector.
func NewDetector(db *ent.Client) *Detector {
	return &Detector{db: db}
}

// FindDuplicates returns groups of files that have identical content.
func (d *Detector) FindDuplicates(ctx context.Context, tenantID int) ([]DuplicateGroup, error) {
	// Get all items for this tenant, grouped by hash
	items, err := d.db.VaultItem.Query().
		Where(
			vaultitem.HasTenantWith(/* tenant predicate */),
			vaultitem.DeletedAtIsNil(), // Exclude soft-deleted items
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	// Group by hash
	hashMap := make(map[string][]*ent.VaultItem)
	for _, item := range items {
		hashMap[item.Hash] = append(hashMap[item.Hash], item)
	}

	// Filter to only groups with duplicates
	var groups []DuplicateGroup
	for hash, groupItems := range hashMap {
		if len(groupItems) > 1 {
			groups = append(groups, DuplicateGroup{
				Hash:  hash,
				Items: groupItems,
				Count: len(groupItems),
			})
		}
	}

	return groups, nil
}
