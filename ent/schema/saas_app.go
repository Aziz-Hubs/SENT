package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// SaaSApp holds the schema definition for the SaaSApp entity.
type SaaSApp struct {
	ent.Schema
}

// Fields of the SaaSApp.
func (SaaSApp) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("provider").NotEmpty(), // e.g., "Microsoft 365", "Google Workspace", "Dropbox"
		field.String("category").Optional(), // e.g., "Collaboration", "Storage"
		field.String("url").Optional(),
		field.Bool("is_managed").Default(false),
		field.JSON("config", map[string]interface{}{}).Default(map[string]interface{}{}),
		field.Other("monthly_price", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero).
			Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the SaaSApp.
func (SaaSApp) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("identities", SaaSIdentity.Type),
		edge.To("filters", SaaSFilter.Type),
		edge.From("tenant", Tenant.Type).Ref("saas_apps").Unique().Required(),
	}
}
