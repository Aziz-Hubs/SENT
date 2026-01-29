package impact

import (
	"context"
	"fmt"

	"sent/ent"
	"sent/ent/asset"
)

type Engine struct {
	client *ent.Client
}

func NewEngine(client *ent.Client) *Engine {
	return &Engine{client: client}
}

// ImpactNode represents a node in the impact graph
type ImpactNode struct {
	ID    int
	Name  string
	Type  string
	Depth int
}

// CalculateBlastRadius performs a recursive search to find all downstream dependencies
func (e *Engine) CalculateBlastRadius(ctx context.Context, assetID int, maxDepth int) ([]ImpactNode, error) {
	if maxDepth <= 0 {
		maxDepth = 3 // Default as per requirements
	}

	// We'll use Ent's query builder to traverse edges. 
	// For complex graphs, a raw SQL recursive CTE might be more performant,
	// but Ent allows us to stay type-safe and idiomatic for the 3-hop limit.

	impacted := make([]ImpactNode, 0)
	visited := make(map[int]bool)
	
	currentLevel := []int{assetID}
	visited[assetID] = true

	for depth := 1; depth <= maxDepth; depth++ {
		if len(currentLevel) == 0 {
			break
		}

		// Query all assets that depend on or are hosted by the current level of assets
		nextLevelAssets, err := e.client.Asset.Query().
			Where(
				asset.Or(
					asset.HasDependsOnWith(asset.IDIn(currentLevel...)),
					asset.HasHostedAtWith(asset.IDIn(currentLevel...)),
				),
			).
			WithType().
			All(ctx)

		if err != nil {
			return nil, fmt.Errorf("failed to query impact at depth %d: %w", depth, err)
		}

		nextLevelIDs := make([]int, 0)
		for _, a := range nextLevelAssets {
			if !visited[a.ID] {
				visited[a.ID] = true
				nextLevelIDs = append(nextLevelIDs, a.ID)
				
				typeName := "unknown"
				if a.Edges.Type != nil {
					typeName = a.Edges.Type.Name
				}

				impacted = append(impacted, ImpactNode{
					ID:    a.ID,
					Name:  a.Name,
					Type:  typeName,
					Depth: depth,
				})
			}
		}
		currentLevel = nextLevelIDs
	}

	return impacted, nil
}
