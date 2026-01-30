package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/shopspring/decimal"
	"time"
)

// StockMovement holds the schema definition for the StockMovement entity.
type StockMovement struct {
	ent.Schema
}

// Fields of the StockMovement.
func (StockMovement) Fields() []ent.Field {
	return []ent.Field{
		field.Other("quantity", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Enum("movement_type").Values("incoming", "outgoing", "manual"),
		field.String("reason").Optional(),
		field.Other("unit_cost", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Optional(),
		field.Other("remaining_quantity", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Optional(),
		field.Other("calculated_cogs", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Optional(),
		field.JSON("metadata", map[string]interface{}{}).Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Indexes of the StockMovement.
func (StockMovement) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("created_at"),
		index.Edges("product"),
		index.Edges("tenant"),
		index.Fields("movement_type"),
	}
}

// Edges of the StockMovement.
func (StockMovement) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("product", Product.Type).Ref("movements").Unique().Required(),
		edge.From("tenant", Tenant.Type).Ref("stock_movements").Unique().Required(),
	}
}