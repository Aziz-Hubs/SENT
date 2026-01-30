package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// SaaSIdentity holds the schema definition for the SaaSIdentity entity.
type SaaSIdentity struct {
	ent.Schema
}

// Fields of the SaaSIdentity.
func (SaaSIdentity) Fields() []ent.Field {
	return []ent.Field{
		field.String("external_id").NotEmpty(), // ID in the SaaS provider
		field.String("email").NotEmpty(),
		field.String("display_name").Optional(),
		field.String("current_plan").Optional(),
		field.JSON("metadata", map[string]interface{}{}).Default(map[string]interface{}{}),
		field.Bool("mfa_enabled").Default(false),
		field.Time("last_login").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the SaaSIdentity.
func (SaaSIdentity) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("saas_identities").Unique(),
		edge.From("app", SaaSApp.Type).Ref("identities").Unique().Required(),
		edge.To("usages", SaaSUsage.Type),
		edge.From("tenant", Tenant.Type).
			Ref("saas_identities").
			Unique().
			Required(),
	}
}

// Indexes of the SaaSIdentity.
func (SaaSIdentity) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("external_id").Edges("app").Unique(),
		index.Fields("email").Edges("tenant").Unique(),
	}
}
