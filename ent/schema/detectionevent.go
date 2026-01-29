package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// DetectionEvent holds the schema definition for the DetectionEvent entity.
type DetectionEvent struct {
	ent.Schema
}

// Fields of the DetectionEvent.
func (DetectionEvent) Fields() []ent.Field {
	return []ent.Field{
		field.String("label"), // person, vehicle, etc.
		field.Float("confidence"),
		field.JSON("box", map[string]float64{}), // {x, y, w, h} normalized
		field.Time("timestamp").Default(time.Now),
		field.String("thumbnail_path").Optional(),
		field.JSON("metadata", map[string]interface{}{}).Optional(),
	}
}

// Edges of the DetectionEvent.
func (DetectionEvent) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("camera", Camera.Type).Ref("detections").Unique().Required(),
	}
}
