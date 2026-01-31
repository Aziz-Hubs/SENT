package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// ProductVariant holds the schema definition for the ProductVariant entity.
type ProductVariant struct {
	ent.Schema
}

// Fields of the ProductVariant.
func (ProductVariant) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty().Comment("Variant name, e.g., 'Large', 'Blue'"),
		field.String("sku").NotEmpty().Unique().Comment("Unique SKU for this specific variant"),
		field.Float("price_adjustment").Default(0).Comment("Amount to add/subtract from base product price"),
		field.Int("stock").Default(0).Min(0).Comment("Inventory count for this variant"),
	}
}

// Edges of the ProductVariant.
func (ProductVariant) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("product", Product.Type).
			Ref("variants").
			Unique().
			Required(),
	}
}
