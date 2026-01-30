package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Agent holds the schema definition for the Agent entity.
type Agent struct {
	ent.Schema
}

// Fields of the Agent.
func (Agent) Fields() []ent.Field {
	return []ent.Field{
		field.String("hostname").NotEmpty(),
		field.String("os").NotEmpty(), // e.g., "linux", "windows"
		field.String("arch").NotEmpty(), // e.g., "amd64", "arm64"
		field.String("ip").NotEmpty(),
		field.String("mac").NotEmpty(),
		field.String("version").NotEmpty(), // Agent version
		field.Enum("status").Values("online", "offline", "warning").Default("offline"),
		field.Time("last_seen").Default(time.Now),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Agent.
func (Agent) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("agents").
			Unique(),
		edge.To("job_executions", JobExecution.Type),
	}
}

// Indexes of the Agent.
func (Agent) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("hostname", "mac").Unique(), // Ensure unique agents
	}
}
