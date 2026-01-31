package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// VaultTemplate holds the schema for document templates.
type VaultTemplate struct {
	ent.Schema
}

// Fields of the VaultTemplate.
func (VaultTemplate) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.Text("description").Optional(),
		field.String("content_hash").NotEmpty(),
		field.String("file_extension").NotEmpty().Comment("e.g., 'docx', 'xlsx'"),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Edges of the VaultTemplate.
func (VaultTemplate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("vault_templates").Unique().Required(),
		edge.From("created_by", User.Type).Ref("created_templates").Unique(),
	}
}
