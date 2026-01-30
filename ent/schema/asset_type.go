package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// AssetType holds the schema definition for the AssetType entity.
type AssetType struct {
	ent.Schema
}

// Fields of the AssetType.
func (AssetType) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("description").Optional(),
	}
}

// Edges of the AssetType.
func (AssetType) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("assets", Asset.Type),
		edge.From("tenant", Tenant.Type).
			Ref("asset_types").
			Unique().
			Required(),
	}
}

// Indexes of the AssetType.
func (AssetType) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
	}
}
