package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// VaultVersion holds the schema for document version history.
type VaultVersion struct {
	ent.Schema
}

// Fields of the VaultVersion.
func (VaultVersion) Fields() []ent.Field {
	return []ent.Field{
		field.Int("version_number").Positive(),
		field.String("hash").NotEmpty(),
		field.Int64("size").Default(0),
		field.String("comment").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Edges of the VaultVersion.
func (VaultVersion) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("item", VaultItem.Type).Ref("versions").Unique().Required(),
		edge.From("created_by", User.Type).Ref("created_versions").Unique(),
	}
}
