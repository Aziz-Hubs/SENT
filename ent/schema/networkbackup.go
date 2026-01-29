package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// NetworkBackup holds the schema definition for the NetworkBackup entity.
type NetworkBackup struct {
	ent.Schema
}

// Fields of the NetworkBackup.
func (NetworkBackup) Fields() []ent.Field {
	return []ent.Field{
		field.String("content_hash"), // CAS identifier
		field.String("vault_path"),   // Path in SENTvault
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the NetworkBackup.
func (NetworkBackup) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("device", NetworkDevice.Type).
			Ref("backups").
			Unique().
			Required(),
		edge.From("tenant", Tenant.Type).
			Ref("network_backups").
			Unique(),
	}
}
