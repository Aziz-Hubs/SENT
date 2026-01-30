package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Department holds the schema definition for the Department entity.
type Department struct {
	ent.Schema
}

// Fields of the Department.
func (Department) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("code"),
		field.String("description").Optional(),
	}
}

// Edges of the Department.
func (Department) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("children", Department.Type).
			From("parent").
			Unique(),
		edge.To("members", Employee.Type),
		edge.To("head", Employee.Type).
			Unique(),
		edge.From("tenant", Tenant.Type).
			Ref("departments").
			Unique().
			Required(),
	}
}

// Indexes of the Department.
func (Department) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
		index.Fields("code").Edges("tenant").Unique(),
	}
}

