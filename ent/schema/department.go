package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Department holds the schema definition for the Department entity.
type Department struct {
	ent.Schema
}

// Fields of the Department.
func (Department) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Unique(),
		field.String("code").Unique(),
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
	}
}
