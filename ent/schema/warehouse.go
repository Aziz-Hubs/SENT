package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Warehouse holds the schema definition for the Warehouse entity.
type Warehouse struct {
	ent.Schema
}

// Fields of the Warehouse.
func (Warehouse) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("location_code").Unique(), // e.g. WH-01
		field.String("address").Optional(),
		field.Bool("is_active").Default(true),
	}
}

// Edges of the Warehouse.
func (Warehouse) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("warehouses").Unique().Required(),
		edge.To("products", Product.Type),
	}
}
