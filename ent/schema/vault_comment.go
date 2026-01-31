package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// VaultComment holds the schema for document annotations.
type VaultComment struct {
	ent.Schema
}

// Fields of the VaultComment.
func (VaultComment) Fields() []ent.Field {
	return []ent.Field{
		field.Text("content").NotEmpty(),
		field.Int("page").Optional().Comment("Page number for PDFs"),
		field.Float("x").Optional().Comment("X coordinate for annotation"),
		field.Float("y").Optional().Comment("Y coordinate for annotation"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the VaultComment.
func (VaultComment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("item", VaultItem.Type).Ref("comments").Unique().Required(),
		edge.From("author", User.Type).Ref("vault_comments").Unique().Required(),
	}
}
