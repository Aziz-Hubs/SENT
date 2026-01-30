package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Job holds the schema definition for the Job entity.
type Job struct {
	ent.Schema
}

// Fields of the Job.
func (Job) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("cron_schedule").Optional(), // If empty, it's a one-time job (or manual)
		field.Time("next_run").Optional(),
		field.Time("last_run").Optional(),
        // For MVP, we'll store targets as a JSON list of Agent IDs. 
        // In future, this could be a relation to a 'Tag' or 'Group' entity.
		field.JSON("targets", []string{}), 
        field.Time("created_at").Default(time.Now),
        field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Job.
func (Job) Edges() []ent.Edge {
	return []ent.Edge{
        edge.From("tenant", Tenant.Type).
            Ref("jobs").
            Unique().
            Required(),
		edge.From("script", Script.Type).
			Ref("jobs").
			Unique().
			Required(),
		edge.To("executions", JobExecution.Type),
	}
}
