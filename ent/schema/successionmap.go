package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// SuccessionMap holds the schema definition for the SuccessionMap entity.
type SuccessionMap struct {
	ent.Schema
}

// Fields of the SuccessionMap.
func (SuccessionMap) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("readiness_level").
			Values("EMERGENCY", "READY_1_YEAR", "READY_2_YEAR"),
		field.String("notes").Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the SuccessionMap.
func (SuccessionMap) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("employee", Employee.Type).
			Ref("succession_plans").
			Unique().
			Required(),
		edge.From("backup_candidate", Employee.Type).
			Ref("backup_for").
			Unique().
			Required(),
	}
}
