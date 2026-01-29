package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
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
		field.Float("total_amount").Default(0),
		field.String("type").Optional(), // sale, refund, manual_adjustment
		field.String("reference").Optional().Unique(),
		field.String("uuid").DefaultFunc(func() string { return uuid.New().String() }).Unique(),
		field.Int("recording_id").Optional().Nillable(),
		field.Enum("approval_status").
			Values("PENDING", "STAGED", "APPROVED", "REJECTED").
			Default("APPROVED"),
		field.Bool("is_intercompany").Default(false),
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