package sop

import (
	"context"
	"time"

	"sent/ent"
	"sent/ent/asset"
	"sent/ent/sop"
)

type Service struct {
	client *ent.Client
}

func NewService(client *ent.Client) *Service {
	return &Service{client: client}
}

func (s *Service) CreateSOP(ctx context.Context, tenantID int, authorID int, title string, content map[string]interface{}, assetID *int) (*ent.SOP, error) {
	builder := s.client.SOP.Create().
		SetTenantID(tenantID).
		SetAuthorID(authorID).
		SetTitle(title).
		SetContent(content)

	if assetID != nil {
		builder.SetAssetID(*assetID)
	}

	return builder.Save(ctx)
}

func (s *Service) UpdateSOP(ctx context.Context, id int, title string, content map[string]interface{}) (*ent.SOP, error) {
	existing, err := s.client.SOP.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.client.SOP.UpdateOne(existing).
		SetTitle(title).
		SetContent(content).
		SetVersion(existing.Version + 1).
		SetUpdatedAt(time.Now()).
		Save(ctx)
}

func (s *Service) GetByAsset(ctx context.Context, assetID int) ([]*ent.SOP, error) {
	return s.client.SOP.Query().
		Where(sop.HasAssetWith(asset.ID(assetID))).
		WithAuthor().
		All(ctx)
}
