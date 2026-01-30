package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/shopspring/decimal"
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
		field.String("number"),
		field.Enum("type").Values("asset", "liability", "equity", "revenue", "expense"),
		field.Other("balance", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Bool("is_intercompany").Default(false),
		field.Time("created_at").Default(time.Now),
	}
}

// Indexes of the Account.
func (Account) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("number").Edges("tenant").Unique(),
		index.Fields("type"),
		index.Fields("name"),
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