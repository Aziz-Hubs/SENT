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

// LedgerEntry holds the schema definition for the LedgerEntry entity.
type LedgerEntry struct {
	ent.Schema
}

// Fields of the LedgerEntry.
func (LedgerEntry) Fields() []ent.Field {
	return []ent.Field{
		field.Other("amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Enum("direction").Values("debit", "credit"),
		field.Time("created_at").Default(time.Now),
	}
}

// Indexes of the LedgerEntry.
func (LedgerEntry) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("transaction"),
		index.Edges("account"),
		index.Edges("tenant"),
		index.Fields("created_at"),
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