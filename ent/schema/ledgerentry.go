package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// LedgerEntry holds the schema definition for the LedgerEntry entity.
type LedgerEntry struct {
	ent.Schema
}

// Fields of the LedgerEntry.
func (LedgerEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Float("amount"),
		field.Enum("direction").Values("debit", "credit"),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the LedgerEntry.
func (LedgerEntry) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("transaction", Transaction.Type).Ref("ledger_entries").Unique().Required(),
		edge.From("account", Account.Type).Ref("entries").Unique().Required(),
		edge.From("tenant", Tenant.Type).Ref("ledger_entries").Unique().Required(),
	}
}