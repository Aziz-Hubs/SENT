package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// JobPosting holds the schema definition for the JobPosting entity.
type JobPosting struct {
	ent.Schema
}

// Fields of the JobPosting.
func (JobPosting) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.Text("description"),
		field.Text("requirements").Optional(),
		field.String("location").Optional(),
		field.String("salary_range").Optional(),
		field.Enum("status").
			Values("DRAFT", "OPEN", "CLOSED", "FILLED").
			Default("DRAFT"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the JobPosting.
func (JobPosting) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("job_postings").
			Unique().
			Required(),
		edge.To("applications", Application.Type),
	}
}

// Indexes of the JobPosting.
func (JobPosting) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Fields("created_at"),
	}
}
