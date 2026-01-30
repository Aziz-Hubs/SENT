package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// SOP holds the schema definition for the SOP entity.
type SOP struct {
	ent.Schema
}

// Fields of the SOP.
func (SOP) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.JSON("content", map[string]interface{}{}).
			SchemaType(map[string]string{
				"postgres": "jsonb",
			}).
			Optional(),
		field.Int("version").Default(1),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the SOP.
func (SOP) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("sops").Unique().Required(),
		edge.From("asset", Asset.Type).Ref("sops").Unique(),
		edge.From("author", User.Type).Ref("authored_sops").Unique(),
	}
}
