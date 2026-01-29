package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Asset holds the schema definition for the Asset entity.
type Asset struct {
	ent.Schema
}

// Fields of the Asset.
func (Asset) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("hardware_id").Unique().Optional(),
		field.String("serial_number").Unique().Optional(),
		field.String("manufacturer").Optional(),
		field.String("vendor_support_phone").Optional(),
		field.Enum("status").
			Values(
				"STAGED_FOR_DEPLOYMENT",
				"ACTIVE",
				"IN_REPAIR",
				"RETIRED",
				"LOST",
				"DISPOSED",
			).
			Default("STAGED_FOR_DEPLOYMENT"),
		field.JSON("metadata", map[string]interface{}{}).Default(map[string]interface{}{}),
		field.Time("last_certified_at").Optional(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Asset.
func (Asset) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("assets").Unique().Required(),
		edge.From("type", AssetType.Type).Ref("assets").Unique().Required(),
		edge.To("hosted_assets", Asset.Type).
			From("hosted_at").
			Unique(),
		edge.To("depends_on", Asset.Type).
			From("dependency_of"),
		edge.From("owner", User.Type).Ref("owned_assets").Unique(),
		edge.To("credentials", Credential.Type),
		edge.To("sops", SOP.Type),
		edge.To("tickets", Ticket.Type),
		edge.To("product", Product.Type).
			Unique(),
	}
}
