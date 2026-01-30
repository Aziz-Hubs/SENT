package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// TimeOffBalance holds the schema for employee time off balances.
type TimeOffBalance struct {
	ent.Schema
}

// Fields of TimeOffBalance.
func (TimeOffBalance) Fields() []ent.Field {
	return []ent.Field{
		field.Int("year"),
		field.Float("available_hours").Default(0),
		field.Float("used_hours").Default(0),
		field.Float("pending_hours").Default(0),
		field.Float("accrued_hours").Default(0),
		field.Float("carried_over_hours").Default(0),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of TimeOffBalance.
func (TimeOffBalance) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("year"),
		index.Fields("year").Edges("employee", "policy").Unique(),
	}
}

// Edges of TimeOffBalance.
func (TimeOffBalance) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("time_off_balances").
			Unique().
			Required(),
		edge.From("employee", Employee.Type).
			Ref("time_off_balances").
			Unique().
			Required(),
		edge.From("policy", TimeOffPolicy.Type).
			Ref("balances").
			Unique().
			Required(),
	}
}
