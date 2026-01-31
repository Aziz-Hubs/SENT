package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// RetentionPolicy holds the schema for document lifecycle policies.
type RetentionPolicy struct {
	ent.Schema
}

// Fields of the RetentionPolicy.
func (RetentionPolicy) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.Text("description").Optional(),
		field.Int("retention_days").Positive(),
		field.Enum("action").Values("archive", "delete").Default("archive"),
		field.String("file_type_filter").Optional().Comment("Comma-separated extensions, e.g., 'pdf,docx'"),
		field.Bool("active").Default(true),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Edges of the RetentionPolicy.
func (RetentionPolicy) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("retention_policies").Unique().Required(),
	}
}
