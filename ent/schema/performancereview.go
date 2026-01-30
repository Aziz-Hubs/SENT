package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// PerformanceReview holds the schema for individual reviews.
type PerformanceReview struct {
	ent.Schema
}

// Fields of PerformanceReview.
func (PerformanceReview) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("overall_rating").
			Values("EXCEPTIONAL", "EXCEEDS", "MEETS", "DEVELOPING", "NEEDS_IMPROVEMENT").
			Optional(),
		field.Text("strengths").Optional(),
		field.Text("areas_for_improvement").Optional(),
		field.Text("manager_comments").Optional(),
		field.JSON("goals_assessment", map[string]interface{}{}).Optional(),
		field.Enum("status").
			Values("PENDING", "IN_PROGRESS", "SUBMITTED", "ACKNOWLEDGED").
			Default("PENDING"),
		field.Time("submitted_at").Optional(),
		field.Time("acknowledged_at").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of PerformanceReview.
func (PerformanceReview) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Edges("employee", "cycle").Unique(),
	}
}

// Edges of PerformanceReview.
func (PerformanceReview) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("performance_reviews").
			Unique().
			Required(),
		edge.From("employee", Employee.Type).
			Ref("performance_reviews").
			Unique().
			Required(),
		edge.From("reviewer", Employee.Type).
			Ref("conducted_reviews").
			Unique(),
		edge.From("cycle", ReviewCycle.Type).
			Ref("reviews").
			Unique().
			Required(),
	}
}
