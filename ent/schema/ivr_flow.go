package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// IVRFlow holds the schema definition for the IVRFlow entity.
type IVRFlow struct {
	ent.Schema
}

// Fields of the IVRFlow.
func (IVRFlow) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.JSON("nodes", map[string]interface{}{}),      // React Flow nodes
		field.JSON("flow_edges", map[string]interface{}{}), // React Flow edges
		field.Bool("is_active").Default(false),
		field.Int("version").Default(1),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the IVRFlow.
func (IVRFlow) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("ivr_flows").Unique().Required(),
	}
}
