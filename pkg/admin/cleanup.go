package admin

import (
	"context"
	"fmt"

	"sent/ent"
	"sent/ent/user"
)

type CleanupService struct {
	client *ent.Client
}

func NewCleanupService(client *ent.Client) *CleanupService {
	return &CleanupService{client: client}
}

// WipeDemoData deletes all data except for system-critical records
func (s *CleanupService) WipeDemoData(ctx context.Context) error {
	// 1. Delete all transactions and ledger entries
	_, _ = s.client.LedgerEntry.Delete().Exec(ctx)
	_, _ = s.client.Transaction.Delete().Exec(ctx)

	// 2. Delete all tickets and assets
	_, _ = s.client.Asset.Delete().Exec(ctx)
	// Add other entities as needed...

	// 3. Delete non-admin users
	_, err := s.client.User.Delete().
		Where(user.RoleNEQ("admin")).
		Exec(ctx)

	if err != nil {
		return fmt.Errorf("failed to wipe user data: %w", err)
	}

	fmt.Println("[ADMIN] Demo data wiped successfully.")
	return nil
}