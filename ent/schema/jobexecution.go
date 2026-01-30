package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// JobExecution holds the schema definition for the JobExecution entity.
type JobExecution struct {
	ent.Schema
}

// Fields of the JobExecution.
func (JobExecution) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").Values("pending", "running", "success", "failed").Default("pending"),
		field.Text("output").Optional(), // Stdout/Stderr from the agent
		field.Time("started_at").Optional(),
		field.Time("completed_at").Optional(),
        field.Time("created_at").Default(time.Now),
	}
}

// Edges of the JobExecution.
func (JobExecution) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("job", Job.Type).
			Ref("executions").
			Unique().
			Required(),
		edge.From("agent", Agent.Type).
			Ref("job_executions").
			Unique().
			Required(),
	}
}
