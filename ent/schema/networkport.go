package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// NetworkPort holds the schema definition for the NetworkPort entity.
type NetworkPort struct {
	ent.Schema
}

// Fields of the NetworkPort.
func (NetworkPort) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"), // GigabitEthernet0/1
		field.String("type").Default("ethernet"),
		field.String("status").Default("down"), // up, down, disabled
		field.Int("vlan").Default(1),
		field.String("mac_address").Optional(),
		field.Bool("poe_enabled").Default(false),
		field.Float("poe_wattage").Default(0),
		field.String("description").Optional(),
	}
}

// Edges of the NetworkPort.
func (NetworkPort) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("device", NetworkDevice.Type).
			Ref("ports").
			Unique().
			Required(),
		edge.To("connected_to", NetworkLink.Type).
			StorageKey(edge.Column("source_port_id")),
	}
}
