package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Permission holds the schema definition for the Permission entity.
type Permission struct {
	ent.Schema
}

// Fields of the Permission.
func (Permission) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("code"), // e.g. "capital:read", "stock:write"
	}
}

// Edges of the Permission.
func (Permission) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("users", User.Type).Ref("permissions"),
		edge.From("tenant", Tenant.Type).
			Ref("permissions").
			Unique().
			Required(),
	}
}

// Indexes of the Permission.
func (Permission) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
		index.Fields("code").Edges("tenant").Unique(),
	}
}