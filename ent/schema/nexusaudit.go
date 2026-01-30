package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// NexusAudit holds the schema definition for the NexusAudit entity.
type NexusAudit struct {
	ent.Schema
}

// Fields of the NexusAudit.
func (NexusAudit) Fields() []ent.Field {
	return []ent.Field{
		field.String("action"), // Reveal, Copy, etc.
		field.String("actor_id"),
		field.String("credential_id").Optional(),
		field.String("reason_code").Optional(),
		field.String("ticket_id").Optional(),
		field.Time("timestamp").Default(time.Now),
		field.JSON("metadata", map[string]interface{}{}).Optional(),
	}
}

// Edges of the NexusAudit.
func (NexusAudit) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("nexus_audits").
			Unique().
			Required(),
	}
}
