package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// TimeOffRequest holds the schema definition for time off requests.
type TimeOffRequest struct {
	ent.Schema
}

// Fields of TimeOffRequest.
func (TimeOffRequest) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("request_type").
			Values("PTO", "SICK", "UNPAID", "PARENTAL", "BEREAVEMENT", "JURY_DUTY").
			Default("PTO"),
		field.Time("start_date"),
		field.Time("end_date"),
		field.Float("requested_hours"),
		field.Enum("status").
			Values("PENDING", "APPROVED", "REJECTED", "CANCELLED").
			Default("PENDING"),
		field.Text("notes").Optional(),
		field.Text("rejection_reason").Optional(),
		field.Time("reviewed_at").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of TimeOffRequest.
func (TimeOffRequest) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Fields("start_date"),
		index.Fields("created_at"),
	}
}

// Edges of TimeOffRequest.
func (TimeOffRequest) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("time_off_requests").
			Unique().
			Required(),
		edge.From("employee", Employee.Type).
			Ref("time_off_requests").
			Unique().
			Required(),
		edge.From("approved_by", Employee.Type).
			Ref("approved_time_off").
			Unique(),
	}
}
