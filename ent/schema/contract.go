package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Contract holds the schema definition for the Contract entity.
type Contract struct {
	ent.Schema
}

// Fields of the Contract.
func (Contract) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Enum("type").Values("block_hours", "flat_rate", "retainer"),
		field.Float("total_hours").Default(0),
		field.Float("remaining_hours").Default(0),
		field.Float("grace_threshold_percent").Default(10.0), // 10% grace
		field.Time("start_date"),
		field.Time("end_date").Optional().Nillable(),
		field.Bool("is_active").Default(true),
	}
}

// Edges of the Contract.
func (Contract) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("contracts").Unique().Required(),
	}
}
