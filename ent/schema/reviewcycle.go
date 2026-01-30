package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// ReviewCycle holds the schema for performance review cycles.
type ReviewCycle struct {
	ent.Schema
}

// Fields of ReviewCycle.
func (ReviewCycle) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Text("description").Optional(),
		field.Enum("cycle_type").
			Values("QUARTERLY", "ANNUAL", "PROBATION", "PROJECT").
			Default("ANNUAL"),
		field.Enum("status").
			Values("DRAFT", "ACTIVE", "CLOSED").
			Default("DRAFT"),
		field.Time("start_date"),
		field.Time("end_date"),
		field.Time("review_deadline").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of ReviewCycle.
func (ReviewCycle) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
		index.Fields("status"),
		index.Fields("start_date"),
	}
}

// Edges of ReviewCycle.
func (ReviewCycle) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("review_cycles").
			Unique().
			Required(),
		edge.To("reviews", PerformanceReview.Type),
	}
}
