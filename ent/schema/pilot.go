package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Ticket holds the schema definition for the Ticket entity.
type Ticket struct {
	ent.Schema
}

// Fields of the Ticket.
func (Ticket) Fields() []ent.Field {
	return []ent.Field{
		field.String("subject"),
		field.Text("description"),
		field.Enum("status").Values("new", "in_progress", "waiting", "resolved", "closed").Default("new"),
		field.Enum("priority").Values("p1", "p2", "p3", "p4").Default("p4"),
		field.String("metadata").Optional(), // For vision-assisted results
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("resolved_at").Optional().Nillable(),
		field.Time("due_date").Optional().Nillable(),
		field.String("claim_lease_owner").Optional(),
		field.Time("claim_lease_expires_at").Optional().Nillable(),
	}
}

// Edges of the Ticket.
func (Ticket) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("tickets").Unique().Required(),
		edge.From("requester", User.Type).Ref("requested_tickets").Unique().Required(),
		edge.From("assignee", User.Type).Ref("assigned_tickets").Unique(),
		edge.From("asset", Asset.Type).Ref("tickets").Unique(),
		edge.To("time_entries", TimeEntry.Type),
		edge.To("remediation_steps", RemediationStep.Type),
	}
}

// TimeEntry tracks work performed on a ticket.
type TimeEntry struct {
	ent.Schema
}

func (TimeEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Float("duration_hours"),
		field.Text("note"),
		field.Time("started_at").Default(time.Now),
		field.Bool("is_billable").Default(true),
		field.Enum("status").Values("pending", "approved", "billed").Default("pending"),
		field.String("work_type").Default("general"),
		field.Int("invoice_id").Optional(),
	}
}

func (TimeEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("ticket", Ticket.Type).Ref("time_entries").Unique().Required(),
		edge.From("technician", User.Type).Ref("time_entries").Unique().Required(),
	}
}

// RemediationStep tracks the state of chained actions.
type RemediationStep struct {
	ent.Schema
}

func (RemediationStep) Fields() []ent.Field {
	return []ent.Field{
		field.String("action_name"),
		field.Int("sequence"),
		field.Enum("status").Values("pending", "running", "success", "failed").Default("pending"),
		field.Text("output").Optional(),
		field.JSON("execution_context", map[string]interface{}{}).Optional(),
	}
}

func (RemediationStep) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("ticket", Ticket.Type).Ref("remediation_steps").Unique().Required(),
	}
}
