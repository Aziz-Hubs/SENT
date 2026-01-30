package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"time"
)

// Transaction holds the schema definition for the Transaction entity.
type Transaction struct {
	ent.Schema
}

// Fields of the Transaction.
func (Transaction) Fields() []ent.Field {
	return []ent.Field{
		field.String("description"),
		field.Time("date").Default(time.Now),
		field.Other("total_amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Other("tax_amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.String("type").Optional(), // sale, refund, manual_adjustment
		field.String("reference").Optional(),
		field.String("uuid").DefaultFunc(func() string { return uuid.New().String() }).Unique(),
		field.Int("recording_id").Optional().Nillable(),
		field.Enum("approval_status").
			Values("PENDING", "STAGED", "APPROVED", "REJECTED").
			Default("APPROVED"),
		field.Bool("is_intercompany").Default(false),
	}
}

// Indexes of the Transaction.
func (Transaction) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("reference").Edges("tenant").Unique(),
		index.Fields("date"),
		index.Fields("type"),
		index.Fields("approval_status"),
	}
}

// Edges of the Transaction.
func (Transaction) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("transactions").Unique().Required(),
		edge.To("ledger_entries", LedgerEntry.Type),
		edge.To("journal_entries", JournalEntry.Type),
		edge.To("recording", Recording.Type).Unique().Field("recording_id"),
		edge.To("approved_by", User.Type).Unique(),
	}
}