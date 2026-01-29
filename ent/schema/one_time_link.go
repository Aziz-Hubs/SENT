package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// OneTimeLink holds the schema definition for the OneTimeLink entity.
type OneTimeLink struct {
	ent.Schema
}

// Fields of the OneTimeLink.
func (OneTimeLink) Fields() []ent.Field {
	return []ent.Field{
		field.Int("tenant_id").Immutable(),
		field.Int("credential_id").Immutable(),
		field.String("token").Unique(),
		field.Time("expires_at"),
		field.Bool("consumed").Default(false),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the OneTimeLink.
func (OneTimeLink) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("credential", Credential.Type).
			Field("credential_id").
			Unique().
			Required().
			Immutable(),
		edge.To("tenant", Tenant.Type).
			Field("tenant_id").
			Unique().
			Required().
			Immutable(),
	}
}
