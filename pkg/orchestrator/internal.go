package orchestrator

import (
	"context"
	"sent/ent"
	"sent/ent/asset"
	"sent/ent/user"
)

type InternalWorkers struct {
	db *ent.Client
}

func (w *InternalWorkers) CleanupAssets(ctx context.Context, userID int) (int, error) {
	return w.db.Asset.Update().
		Where(asset.HasOwnerWith(user.ID(userID))).
		ClearOwner().
		Save(ctx)
}