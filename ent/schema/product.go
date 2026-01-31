package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/shopspring/decimal"
	"time"
)

// Product holds the schema definition for the Product entity.
type Product struct {
	ent.Schema
}

// Fields of the Product.
func (Product) Fields() []ent.Field {
	return []ent.Field{
		field.String("sku"),
		field.String("name"),
		field.String("description").Optional(),
		field.Other("unit_cost", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Other("quantity", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.JSON("attributes", map[string]interface{}{}).
			SchemaType(map[string]string{
				"postgres": "jsonb",
			}).
			Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Int("min_stock_level").Default(0),
		field.Int("max_stock_level").Default(0),
		field.String("barcode").Optional().Unique(),
		field.String("location").Optional(), // e.g. "Aisle 1, Bin B"
		field.Bool("is_variant_parent").Default(false),
		// Serial number tracking
		field.String("serial_number").Optional().Unique(),
		// Depreciation fields
		field.Time("purchase_date").Optional(),
		field.Other("purchase_price", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Optional(),
		field.Int("useful_life_months").Optional(),
		// Warranty tracking
		field.Time("warranty_expires_at").Optional(),
		// Disposal tracking
		field.Time("disposal_date").Optional(),
		field.String("disposal_reason").Optional(),
		field.Bool("is_disposed").Default(false),
	}
}

// Indexes of the Product.
func (Product) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("sku").Edges("tenant").Unique(),
		index.Fields("name"),
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
		edge.From("supplier", Supplier.Type).Ref("products").Unique(),
		edge.From("category", Category.Type).Ref("products").Unique(),
		edge.From("warehouse", Warehouse.Type).Ref("products").Unique(),
		edge.To("assignments", AssetAssignment.Type),
		edge.To("variants", ProductVariant.Type),
		edge.To("maintenance_schedules", MaintenanceSchedule.Type),
		edge.To("alerts", StockAlert.Type),
		edge.To("purchase_order_lines", PurchaseOrderLine.Type),
		edge.To("inventory_counts", InventoryCount.Type),
	}
}