package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// CallLog holds the schema definition for the CallLog entity.
type CallLog struct {
	ent.Schema
}

// Fields of the CallLog.
func (CallLog) Fields() []ent.Field {
	return []ent.Field{
		field.String("caller"),
		field.String("callee"),
		field.Enum("direction").Values("inbound", "outbound"),
		field.Time("start_time").Default(time.Now),
		field.Time("end_time").Optional(),
		field.Int("duration").Default(0), // in seconds
		field.String("status"),           // completed, missed, failed, etc.
		field.String("recording_path").Optional(),
		field.String("transcript").Optional(),
	}
}

// Edges of the CallLog.
func (CallLog) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("call_logs").Unique().Required(),
		edge.From("user", User.Type).Ref("call_logs").Unique(), // The internal user involved
	}
}
