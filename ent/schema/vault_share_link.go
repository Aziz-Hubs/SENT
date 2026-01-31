package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "time"
)

// VaultShareLink holds the schema definition for the VaultShareLink entity.
type VaultShareLink struct {
    ent.Schema
}

// Fields of the VaultShareLink.
func (VaultShareLink) Fields() []ent.Field {
    return []ent.Field{
        field.String("token").Unique(),
        field.String("name").Optional(), // Custom name for the link
        field.String("password_hash").Optional(),
        field.Time("expires_at"),
        field.Int("max_views").Default(0), // 0 = unlimited
        field.Int("view_count").Default(0),
        field.Time("created_at").Default(time.Now),
    }
}

// Edges of the VaultShareLink.
func (VaultShareLink) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("item", VaultItem.Type).Ref("share_links").Unique().Required(),
        edge.From("tenant", Tenant.Type).Ref("vault_share_links").Unique().Required(),
    }
}
