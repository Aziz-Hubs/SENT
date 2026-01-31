package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Supplier holds the schema definition for the Supplier entity.
type Supplier struct {
	ent.Schema
}

// Fields of the Supplier.
func (Supplier) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("contact_person").Optional(),
		field.String("email").Optional(),
		field.String("phone").Optional(),
		field.String("address").Optional(),
		field.String("website").Optional(),
	}
}

// Edges of the Supplier.
func (Supplier) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("suppliers").Unique().Required(),
		edge.To("products", Product.Type),
		edge.To("purchase_orders", PurchaseOrder.Type),
	}
}
