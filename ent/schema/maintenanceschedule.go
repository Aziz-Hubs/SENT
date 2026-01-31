package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// MaintenanceSchedule holds the schema for scheduled maintenance tasks.
type MaintenanceSchedule struct {
	ent.Schema
}

func (MaintenanceSchedule) Fields() []ent.Field {
	return []ent.Field{
		field.Time("scheduled_at"),
		field.Time("completed_at").Optional(),
		field.String("notes").Optional(),
		field.Enum("status").Values("pending", "completed", "overdue").Default("pending"),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

func (MaintenanceSchedule) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("maintenance_schedules").Unique().Required(),
		edge.From("product", Product.Type).Ref("maintenance_schedules").Unique().Required(),
	}
}
