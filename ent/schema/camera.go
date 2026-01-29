package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Camera holds the schema definition for the Camera entity.
type Camera struct {
	ent.Schema
}

// Fields of the Camera.
func (Camera) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("rtsp_url"),
		field.String("ip_address").Optional(),
		field.Int("onvif_port").Default(80),
		field.String("username").Optional(),
		field.String("password").Optional().Sensitive(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Camera.
func (Camera) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("cameras").Unique().Required(),
		edge.To("recordings", Recording.Type),
		edge.To("detections", DetectionEvent.Type),
	}
}
