package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// StockAlert holds the schema for stock alerts.
type StockAlert struct {
	ent.Schema
}

func (StockAlert) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("alert_type").Values("low_stock", "warranty_expiring", "maintenance_due"),
		field.String("message"),
		field.Bool("is_read").Default(false),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

func (StockAlert) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("stock_alerts").Unique().Required(),
		edge.From("product", Product.Type).Ref("alerts").Unique(),
	}
}
