package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// StockMovement holds the schema definition for the StockMovement entity.
type StockMovement struct {
	ent.Schema
}

// Fields of the StockMovement.
func (StockMovement) Fields() []ent.Field {
	return []ent.Field{
		field.Float("quantity"),
		field.Enum("movement_type").Values("incoming", "outgoing", "manual"),
		field.String("reason").Optional(),
		field.Float("unit_cost").Optional(),                     // Cost at which the items were acquired or sold
		field.Float("remaining_quantity").Optional().Nillable(), // For incoming: amount not yet consumed by FIFO
		field.Float("calculated_cogs").Optional().Nillable(),    // For outgoing: total cost of goods sold calculated
		field.JSON("metadata", map[string]interface{}{}).Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the StockMovement.
func (StockMovement) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("product", Product.Type).Ref("movements").Unique().Required(),
		edge.From("tenant", Tenant.Type).Ref("stock_movements").Unique().Required(),
	}
}