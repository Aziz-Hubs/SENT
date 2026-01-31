package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// InventoryCount holds the schema for physical inventory counts.
type InventoryCount struct {
	ent.Schema
}

func (InventoryCount) Fields() []ent.Field {
	return []ent.Field{
		field.Other("counted_qty", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}),
		field.Other("system_qty", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}),
		field.Other("variance", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}),
		field.Time("counted_at").Default(time.Now),
		field.String("counted_by").Optional(),
		field.String("notes").Optional(),
	}
}

func (InventoryCount) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("inventory_counts").Unique().Required(),
		edge.From("product", Product.Type).Ref("inventory_counts").Unique().Required(),
	}
}
