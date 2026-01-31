package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Candidate holds the schema definition for the Candidate entity.
type Candidate struct {
	ent.Schema
}

// Fields of the Candidate.
func (Candidate) Fields() []ent.Field {
	return []ent.Field{
		field.String("first_name"),
		field.String("last_name"),
		field.String("email"),
		field.String("phone").Optional(),
		field.String("resume_url").Optional(),
		field.String("linkedin_url").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Candidate.
func (Candidate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("candidates").
			Unique().
			Required(),
		edge.To("applications", Application.Type),
	}
}

// Indexes of the Candidate.
func (Candidate) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("email").Edges("tenant").Unique(),
		index.Fields("created_at"),
	}
}
