package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// SaaSFilter holds the schema definition for the SaaSFilter entity.
type SaaSFilter struct {
	ent.Schema
}

// Fields of the SaaSFilter.
func (SaaSFilter) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("domain_pattern").NotEmpty(), // e.g., "*.dropbox.com"
		field.Enum("action").Values("ALLOW", "BLOCK").Default("BLOCK"),
		field.String("reason").Optional(),
		field.Bool("is_sni_based").Default(true),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the SaaSFilter.
func (SaaSFilter) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("app", SaaSApp.Type).Ref("filters").Unique(),
		edge.From("tenant", Tenant.Type).Ref("saas_filters").Unique().Required(),
	}
}
