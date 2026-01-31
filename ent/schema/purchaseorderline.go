package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
)

// PurchaseOrderLine holds line items for purchase orders.
type PurchaseOrderLine struct {
	ent.Schema
}

func (PurchaseOrderLine) Fields() []ent.Field {
	return []ent.Field{
		field.Int("quantity"),
		field.Other("unit_cost", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Int("received_qty").Default(0),
	}
}

func (PurchaseOrderLine) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("purchase_order", PurchaseOrder.Type).Ref("lines").Unique().Required(),
		edge.From("product", Product.Type).Ref("purchase_order_lines").Unique().Required(),
	}
}
