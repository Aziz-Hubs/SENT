package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
)

// TenantMixin provides a shared tenant edge and common indices for multi-tenant isolation.
type TenantMixin struct {
	mixin.Schema
}

// Edges of the TenantMixin.
func (TenantMixin) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("%s"). // Placeholder, used by schemas to specify their back-ref
			Unique().
			Required(),
	}
}

// Indexes of the TenantMixin.
func (TenantMixin) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("tenant"),
	}
}
