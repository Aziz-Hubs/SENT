package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// TimeEntry holds the schema definition for the TimeEntry entity.
type TimeEntry struct {
	ent.Schema
}

// Fields of the TimeEntry.
func (TimeEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Time("start_time").Default(time.Now).Comment("When the shift started"),
		field.Time("end_time").Optional().Comment("When the shift ended"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Int("ticket_id").Optional().Comment("Associated ticket for billing"),
		field.Int("technician_id").Optional().Comment("Assigned technician user ID"),
		field.Enum("status").Values("pending", "approved", "billed").Default("pending").Comment("Billing workflow status"),
		field.String("work_type").Default("general").Comment("Type of work performed"),
		field.Float("duration_hours").Optional().Comment("Duration in hours"),
		field.Int("invoice_id").Optional().Comment("Associated invoice ID when billed"),
	}
}

// Edges of the TimeEntry.
func (TimeEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("employee", Employee.Type).Ref("time_entries").Unique().Required(),
		edge.To("ticket", Ticket.Type).Field("ticket_id").Unique(),
	}
}

