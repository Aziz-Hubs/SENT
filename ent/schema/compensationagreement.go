package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// CompensationAgreement holds the schema definition for the CompensationAgreement entity.
type CompensationAgreement struct {
	ent.Schema
}

// Fields of the CompensationAgreement.
func (CompensationAgreement) Fields() []ent.Field {
	return []ent.Field{
		field.Float("base_salary"), // Using float for now, but in logic we use shopspring/decimal
		field.String("currency").Default("USD"),
		field.Time("effective_date").Default(time.Now),
		field.Enum("status").
			Values("ACTIVE", "ARCHIVED").
			Default("ACTIVE"),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the CompensationAgreement.
func (CompensationAgreement) Edges() []ent.Edge {
        return []ent.Edge{
                edge.From("tenant", Tenant.Type).
                        Ref("compensation_agreements").
                        Unique().
                        Required(),
                edge.From("employee", Employee.Type).			Ref("compensation_agreements").
			Unique().
			Required(),
	}
}
