package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Interview holds the schema definition for the Interview entity.
type Interview struct {
	ent.Schema
}

// Fields of the Interview.
func (Interview) Fields() []ent.Field {
	return []ent.Field{
		field.Time("scheduled_at"),
		field.Enum("type").
			Values("PHONE", "VIDEO", "ONSITE").
			Default("VIDEO"),
		field.Enum("status").
			Values("SCHEDULED", "COMPLETED", "CANCELLED").
			Default("SCHEDULED"),
		field.Text("feedback").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Interview.
func (Interview) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("interviews").
			Unique().
			Required(),
		edge.From("application", Application.Type).
			Ref("interviews").
			Unique().
			Required(),
		edge.From("interviewers", Employee.Type).
			Ref("conducted_interviews"),
	}
}

// Indexes of the Interview.
func (Interview) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("scheduled_at"),
		index.Fields("status"),
	}
}
