package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// BenefitPlan holds the schema for benefit plans.
type BenefitPlan struct {
	ent.Schema
}

// Fields of BenefitPlan.
func (BenefitPlan) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Text("description").Optional(),
		field.Enum("type").
			Values("MEDICAL", "DENTAL", "VISION", "RETIREMENT", "OTHER").
			Default("MEDICAL"),
		field.Enum("status").
			Values("ACTIVE", "INACTIVE", "DRAFT").
			Default("DRAFT"),
		field.Float("employer_contribution").Comment("Fixed amount or percentage"),
		field.Float("employee_deduction").Comment("Fixed amount or deduction"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of BenefitPlan.
func (BenefitPlan) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("name").Edges("tenant").Unique(),
		index.Fields("type"),
		index.Fields("status"),
	}
}

// Edges of BenefitPlan.
func (BenefitPlan) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("benefit_plans").
			Unique().
			Required(),
		edge.To("enrollments", BenefitEnrollment.Type),
	}
}
