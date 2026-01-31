package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// AssetAssignment holds the schema assignment of a product to an entity (Employee).
type AssetAssignment struct {
	ent.Schema
}

// Fields.
func (AssetAssignment) Fields() []ent.Field {
	return []ent.Field{
		field.Time("assigned_at").Default(time.Now),
		field.Time("returned_at").Optional().Nillable(),
		field.Enum("status").Values("active", "returned", "lost").Default("active"),
		field.Int("quantity").Default(1),
	}
}

// Edges.
func (AssetAssignment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("asset_assignments").Unique().Required(),
		edge.From("product", Product.Type).Ref("assignments").Unique().Required(),
		edge.From("employee", Employee.Type).Ref("asset_assignments").Unique().Required(),
	}
}
