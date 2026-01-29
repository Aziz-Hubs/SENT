package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// HealthScoreSnapshot holds the schema definition for the HealthScoreSnapshot entity.
type HealthScoreSnapshot struct {
	ent.Schema
}

// Fields of the HealthScoreSnapshot.
func (HealthScoreSnapshot) Fields() []ent.Field {
	return []ent.Field{
		field.Float("overall_score"),
		field.Float("performance_score"),
		field.Float("security_score"),
		field.Float("lifecycle_score"),
		field.JSON("metadata", map[string]interface{}{}).Optional(), // Store weighted factors used
		field.Time("timestamp").Default(time.Now),
	}
}

// Edges of the HealthScoreSnapshot.
func (HealthScoreSnapshot) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("health_snapshots").
			Unique().
			Required(),
	}
}
