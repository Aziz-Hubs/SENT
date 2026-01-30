package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Credential holds the schema definition for the Credential entity.
type Credential struct {
	ent.Schema
}

// Fields of the Credential.
func (Credential) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("username").Optional(),
		field.Bytes("password_encrypted"),
		field.Time("last_revealed_at").Optional(),
		field.JSON("metadata", map[string]interface{}{}).Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the Credential.
func (Credential) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("credentials").Unique().Required(),
		edge.From("asset", Asset.Type).Ref("credentials").Unique(),
		edge.To("one_time_links", OneTimeLink.Type),
	}
}
