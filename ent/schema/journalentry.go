package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// JournalEntry holds the schema definition for the JournalEntry entity.
type JournalEntry struct {
	ent.Schema
}

// Fields of the JournalEntry.
func (JournalEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Other("amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Enum("direction").Values("debit", "credit"),
		field.Time("created_at").Default(time.Now),
		field.String("description").Optional(),
		field.Enum("approval_status").
			Values("STAGED", "APPROVED", "REJECTED").
			Default("APPROVED"),
		field.Int("approved_by_id").Optional().Nillable(),
	}
}

// Edges of the JournalEntry.
func (JournalEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("account", Account.Type).Ref("journal_entries").Unique().Required(),
		edge.From("tenant", Tenant.Type).Ref("journal_entries").Unique().Required(),
		edge.From("transaction", Transaction.Type).Ref("journal_entries").Unique(),
		edge.To("approved_by", User.Type).Unique().Field("approved_by_id"),
	}
}