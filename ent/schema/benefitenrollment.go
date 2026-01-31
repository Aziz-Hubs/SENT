package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// BenefitEnrollment holds the schema for benefit enrollments.
type BenefitEnrollment struct {
	ent.Schema
}

// Fields of BenefitEnrollment.
func (BenefitEnrollment) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("tier").
			Values("INDIVIDUAL", "FAMILY", "COUPLE", "CHILDREN_ONLY").
			Default("INDIVIDUAL"),
		field.Float("employee_cost").Comment("Actual monthly cost to employee"),
		field.Float("employer_cost").Comment("Actual monthly cost to employer"),
		field.Enum("status").
			Values("ACTIVE", "PENDING", "TERMINATED").
			Default("PENDING"),
		field.Time("effective_from"),
		field.Time("effective_to").Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of BenefitEnrollment.
func (BenefitEnrollment) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("status"),
		index.Edges("employee", "plan").Unique(), // Prevent duplicate active enrollments in code logic, but unique constraint here helps
	}
}

// Edges of BenefitEnrollment.
func (BenefitEnrollment) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("benefit_enrollments").
			Unique().
			Required(),
		edge.From("plan", BenefitPlan.Type).
			Ref("enrollments").
			Unique().
			Required(),
		edge.From("employee", Employee.Type).
			Ref("benefit_enrollments").
			Unique().
			Required(),
	}
}
