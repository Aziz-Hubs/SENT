package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Account holds the schema definition for the Account entity.
type Account struct {
	ent.Schema
}

// Fields of the Account.
func (Account) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("number").Unique(),
		field.Enum("type").Values("asset", "liability", "equity", "revenue", "expense"),
		field.Float("balance").Default(0),
		field.Bool("is_intercompany").Default(false),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the Account.
func (Account) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("accounts").Unique().Required(),
		edge.To("entries", LedgerEntry.Type),
		edge.To("journal_entries", JournalEntry.Type),
		edge.To("recurring_invoices", RecurringInvoice.Type),
	}
}