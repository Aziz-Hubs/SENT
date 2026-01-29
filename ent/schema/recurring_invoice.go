package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// RecurringInvoice holds the schema definition for the RecurringInvoice entity.
type RecurringInvoice struct {
	ent.Schema
}

// Fields of the RecurringInvoice.
func (RecurringInvoice) Fields() []ent.Field {
	return []ent.Field{
		field.String("description"),
		field.Float("amount"),
		field.String("currency").Default("USD"),
		field.String("frequency").Default("monthly"), // monthly, quarterly, yearly
		field.Time("next_run_date").Default(time.Now),
		field.Time("last_run_date").Optional().Nillable(),
		field.Bool("is_active").Default(true),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the RecurringInvoice.
func (RecurringInvoice) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("recurring_invoices").Unique().Required(),
		edge.From("account", Account.Type).Ref("recurring_invoices").Unique().Required(), // The revenue account
	}
}
