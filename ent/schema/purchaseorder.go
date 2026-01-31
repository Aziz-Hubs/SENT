package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// PurchaseOrder holds the schema for purchase orders.
type PurchaseOrder struct {
	ent.Schema
}

func (PurchaseOrder) Fields() []ent.Field {
	return []ent.Field{
		field.String("po_number").Unique(),
		field.Enum("status").Values("draft", "submitted", "received", "cancelled").Default("draft"),
		field.Time("order_date").Default(time.Now),
		field.Time("expected_date").Optional(),
		field.Other("total_amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.String("notes").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (PurchaseOrder) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("purchase_orders").Unique().Required(),
		edge.From("supplier", Supplier.Type).Ref("purchase_orders").Unique().Required(),
		edge.To("lines", PurchaseOrderLine.Type),
	}
}
