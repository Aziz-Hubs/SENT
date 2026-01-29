package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// InventoryReservation holds the schema definition for the InventoryReservation entity.
type InventoryReservation struct {
	ent.Schema
}

// Fields of the InventoryReservation.
func (InventoryReservation) Fields() []ent.Field {
	return []ent.Field{
		field.Float("quantity"),
		field.Time("expires_at"),
		field.Enum("status").
			Values("active", "released", "completed").
			Default("active"),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the InventoryReservation.
func (InventoryReservation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("product", Product.Type).Ref("reservations").Unique().Required(),
		edge.From("tenant", Tenant.Type).Ref("inventory_reservations").Unique().Required(),
	}
}
