package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Product holds the schema definition for the Product entity.
type Product struct {
	ent.Schema
}

// Fields of the Product.
func (Product) Fields() []ent.Field {
	return []ent.Field{
		field.String("sku").Unique(),
		field.String("name"),
		field.String("description").Optional(),
		field.Float("unit_cost").Default(0),
		field.Float("quantity").Default(0),
		field.JSON("attributes", map[string]interface{}{}).
			Optional(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of the Product.
func (Product) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("sku").Unique(),
		index.Fields("attributes").
			Annotations(
				entsql.IndexType("GIN"),
			),
	}
}

// Edges of the Product.
func (Product) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("products").Unique().Required(),
		edge.To("movements", StockMovement.Type),
		edge.To("reservations", InventoryReservation.Type),
		edge.To("vendor", Account.Type).
			Unique(),
	}
}