package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// LegalHold holds the schema for litigation holds.
type LegalHold struct {
	ent.Schema
}

// Fields of the LegalHold.
func (LegalHold) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.Text("description").Optional(),
		field.Time("start_date").Default(time.Now),
		field.Time("end_date").Optional().Nillable(),
		field.Bool("active").Default(true),
		field.Time("created_at").Default(time.Now).Immutable(),
	}
}

// Edges of the LegalHold.
func (LegalHold) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("legal_holds").Unique().Required(),
		edge.From("created_by", User.Type).Ref("created_legal_holds").Unique(),
		edge.To("items", VaultItem.Type),
	}
}
