package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
)

// ServiceRate holds the schema definition for the ServiceRate entity.
type ServiceRate struct {
	ent.Schema
}

// Fields of the ServiceRate.
func (ServiceRate) Fields() []ent.Field {
	return []ent.Field{
		field.String("work_type").Unique(),
		field.Other("rate", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.String("description").Optional(),
	}
}

// Edges of the ServiceRate.
func (ServiceRate) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("service_rates").Unique().Required(),
	}
}
