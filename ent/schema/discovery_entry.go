package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// DiscoveryEntry holds the schema definition for the DiscoveryEntry entity.
type DiscoveryEntry struct {
	ent.Schema
}

// Fields of the DiscoveryEntry.
func (DiscoveryEntry) Fields() []ent.Field {
	return []ent.Field{
		field.String("hardware_id").Unique(),
		field.String("name"),
		field.String("hostname").Optional(),
		field.String("ip").Optional(),
		field.String("mac").Optional(),
		field.String("type"),
		field.JSON("metadata", map[string]interface{}{}),
		field.Enum("status").Values("pending", "approved", "rejected").Default("pending"),
		field.Time("discovered_at").Default(time.Now),
	}
}

// Edges of the DiscoveryEntry.
func (DiscoveryEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("discovery_entries").Unique().Required(),
	}
}
