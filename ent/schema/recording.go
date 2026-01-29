package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Recording holds the schema definition for the Recording entity.
type Recording struct {
	ent.Schema
}

// Fields of the Recording.
func (Recording) Fields() []ent.Field {
	return []ent.Field{
		field.String("path"),
		field.Time("start_time"),
		field.Time("end_time").Optional(),
		field.Float("size_bytes").Optional(),
		field.String("type").Default("continuous"), // continuous, motion, forensic
	}
}

// Edges of the Recording.
func (Recording) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("camera", Camera.Type).Ref("recordings").Unique().Required(),
	}
}
