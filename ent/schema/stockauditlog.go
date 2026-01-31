package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// StockAuditLog holds the schema for audit trail entries.
type StockAuditLog struct {
	ent.Schema
}

func (StockAuditLog) Fields() []ent.Field {
	return []ent.Field{
		field.String("action"),           // create, update, delete, assign, return, dispose
		field.String("entity_type"),      // product, supplier, category, etc.
		field.Int("entity_id"),
		field.Int("user_id").Optional(),
		field.String("user_name").Optional(),
		field.JSON("details", map[string]interface{}{}).
			SchemaType(map[string]string{
				dialect.Postgres: "jsonb",
			}).
			Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

func (StockAuditLog) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("stock_audit_logs").Unique().Required(),
	}
}
