package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// TimeOffPolicy holds the schema definition for time off policies.
type TimeOffPolicy struct {
	ent.Schema
}

// Fields of TimeOffPolicy.
func (TimeOffPolicy) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Text("description").Optional(),
		field.Enum("policy_type").
			Values("ACCRUAL", "UNLIMITED", "FIXED").
			Default("FIXED"),
		field.Enum("leave_type").
			Values("PTO", "SICK", "UNPAID", "PARENTAL", "BEREAVEMENT", "JURY_DUTY").
			Default("PTO"),
		field.Float("annual_allowance").Default(0), // Hours per year
		field.Float("accrual_rate").Optional(),     // Hours per pay period (for ACCRUAL type)
		field.Float("carry_over_max").Default(0),   // Max hours to carry over to next year
		field.Bool("requires_approval").Default(true),
		field.Int("min_notice_days").Default(0), // Minimum days notice required
		field.Bool("is_active").Default(true),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of TimeOffPolicy.
func (TimeOffPolicy) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
		index.Fields("leave_type"),
		index.Fields("is_active"),
	}
}

// Edges of TimeOffPolicy.
func (TimeOffPolicy) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("time_off_policies").
			Unique().
			Required(),
		edge.To("balances", TimeOffBalance.Type),
	}
}
