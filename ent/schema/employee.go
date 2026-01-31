package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// Employee holds the schema definition for the Employee entity.
type Employee struct {
	ent.Schema
}

// Fields of the Employee.
func (Employee) Fields() []ent.Field {
	return []ent.Field{
		field.String("zitadel_id").Unique(),
		field.String("employee_id"),
		field.String("first_name"),
		field.String("last_name"),
		field.String("email"),
		field.String("phone").Optional(),
		field.Enum("status").
			Values("STAGED", "ACTIVE", "TERMINATED").
			Default("STAGED"),
		field.String("salary_encrypted"),
		field.String("bank_details_encrypted").Optional(),
		field.String("signature_hash").Optional(),
		field.Time("signed_at").Optional(),
		field.Bool("hipo_status").Default(false),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of the Employee.
func (Employee) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("email").Edges("tenant").Unique(),
		index.Fields("employee_id").Edges("tenant").Unique(),
		index.Fields("status"),
		index.Fields("created_at"),
	}
}

// Edges of the Employee.
func (Employee) Edges() []ent.Edge {
        return []ent.Edge{
                edge.From("tenant", Tenant.Type).
                        Ref("employees").
                        Unique().
                        Required(),
                edge.From("department", Department.Type).			Ref("members").
			Unique(),
		edge.To("subordinates", Employee.Type).
			From("manager").
			Unique(),
		edge.To("compensation_agreements", CompensationAgreement.Type),
		edge.To("succession_plans", SuccessionMap.Type).
			StorageKey(edge.Column("employee_id")),
		edge.To("backup_for", SuccessionMap.Type).
			StorageKey(edge.Column("backup_candidate_id")),
		edge.To("expense_account", Account.Type).
			Unique(),
		edge.To("time_off_requests", TimeOffRequest.Type),
		edge.To("approved_time_off", TimeOffRequest.Type),
		edge.To("time_off_balances", TimeOffBalance.Type),
		edge.To("performance_reviews", PerformanceReview.Type),
		edge.To("conducted_reviews", PerformanceReview.Type),
		edge.To("goals", Goal.Type),
		edge.To("asset_assignments", AssetAssignment.Type),
		edge.To("time_entries", TimeEntry.Type),
		edge.To("conducted_interviews", Interview.Type),
		edge.To("benefit_enrollments", BenefitEnrollment.Type),
	}
}
