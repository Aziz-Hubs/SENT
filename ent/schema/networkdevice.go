package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// NetworkDevice holds the schema definition for the NetworkDevice entity.
type NetworkDevice struct {
	ent.Schema
}

// Fields of the NetworkDevice.
func (NetworkDevice) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Unique(),
		field.String("ip_address"),
		field.String("vendor").Default("generic"), // cisco, juniper, fortinet, etc.
		field.String("model").Optional(),
		field.String("software_version").Optional(),
		field.Enum("status").
			Values("ONLINE", "OFFLINE", "MAINTENANCE").
			Default("OFFLINE"),
		field.Time("last_polled").Optional(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the NetworkDevice.
func (NetworkDevice) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("ports", NetworkPort.Type),
		edge.To("backups", NetworkBackup.Type),
	}
}
