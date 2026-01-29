package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// ServiceRate holds the schema definition for the ServiceRate entity.
type ServiceRate struct {
	ent.Schema
}

// Fields of the ServiceRate.
func (ServiceRate) Fields() []ent.Field {
	return []ent.Field{
		field.String("work_type").Unique(),
		field.Float("rate"), // Hourly rate
		field.String("description").Optional(),
	}
}

// Edges of the ServiceRate.
func (ServiceRate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("service_rates").Unique().Required(),
	}
}
