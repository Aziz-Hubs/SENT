package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// VaultItem holds the schema definition for the VaultItem entity.
type VaultItem struct {
	ent.Schema
}

// Fields of the VaultItem.
func (VaultItem) Fields() []ent.Field {
	return []ent.Field{
		field.String("path").NotEmpty(),
		field.String("name").NotEmpty(),
		field.Int64("size").Default(0),
		field.String("hash").NotEmpty(), // SHA-256 for CAS
		field.Text("content").Optional(), // Extracted OCR text
		field.Bool("is_dir").Default(false),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the VaultItem.
func (VaultItem) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("vault_items").Unique().Required(),
	}
}

// Indexes of the VaultItem.
func (VaultItem) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("path").Edges("tenant").Unique(), // Ensure unique path per tenant
		index.Fields("hash"),
	}
}
