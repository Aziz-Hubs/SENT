package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Application holds the schema definition for the Application entity.
type Application struct {
	ent.Schema
}

// Fields of the Application.
func (Application) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("NEW", "SCREENING", "INTERVIEWING", "OFFER", "HIRED", "REJECTED").
			Default("NEW"),
		field.Time("applied_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Application.
func (Application) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("applications").
			Unique().
			Required(),
		edge.From("job_posting", JobPosting.Type).
			Ref("applications").
			Unique().
			Required(),
		edge.From("candidate", Candidate.Type).
			Ref("applications").
			Unique().
			Required(),
		edge.To("interviews", Interview.Type),
	}
}

// Indexes of the Application.
func (Application) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Fields("applied_at"),
	}
}
