package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// NetworkLink holds the schema definition for the NetworkLink entity.
type NetworkLink struct {
	ent.Schema
}

// Fields of the NetworkLink.
func (NetworkLink) Fields() []ent.Field {
	return []ent.Field{
		field.String("protocol").Default("LLDP"), // LLDP, CDP, STATIC
		field.Time("last_seen").Default(time.Now),
	}
}

// Edges of the NetworkLink.
func (NetworkLink) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("source_port", NetworkPort.Type).
			Ref("connected_to").
			Unique().
			Required(),
		edge.To("target_port", NetworkPort.Type).
			Unique().
			Required(),
	}
}
