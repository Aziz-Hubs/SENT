package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// VaultFavorite holds the schema for user-starred files.
type VaultFavorite struct {
	ent.Schema
}

// Fields of the VaultFavorite.
func (VaultFavorite) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Edges of the VaultFavorite.
func (VaultFavorite) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("favorites").Unique().Required(),
		edge.From("item", VaultItem.Type).Ref("favorited_by").Unique().Required(),
	}
}

// Indexes of the VaultFavorite.
func (VaultFavorite) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user", "item").Unique(),
	}
}
