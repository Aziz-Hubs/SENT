package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Goal holds the schema for employee goals.
type Goal struct {
	ent.Schema
}

// Fields of Goal.
func (Goal) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.Text("description").Optional(),
		field.Enum("category").
			Values("PERFORMANCE", "DEVELOPMENT", "PROJECT", "BEHAVIORAL").
			Default("PERFORMANCE"),
		field.Enum("status").
			Values("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED").
			Default("NOT_STARTED"),
		field.Int("progress").Default(0).Min(0).Max(100),
		field.Time("target_date").Optional(),
		field.Text("key_results").Optional(),
		field.Text("manager_notes").Optional(),
		field.Time("completed_at").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of Goal.
func (Goal) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Fields("target_date"),
		index.Fields("created_at"),
	}
}

// Edges of Goal.
func (Goal) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("goals").
			Unique().
			Required(),
		edge.From("employee", Employee.Type).
			Ref("goals").
			Unique().
			Required(),
	}
}
