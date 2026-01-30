package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// BudgetForecast holds the schema definition for the BudgetForecast entity.
type BudgetForecast struct {
	ent.Schema
}

// Fields of the BudgetForecast.
func (BudgetForecast) Fields() []ent.Field {
	return []ent.Field{
		field.Int("year"),
		field.Int("month"),
		field.Other("projected_amount", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Other("actual_spent", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.JSON("forecast_data", map[string]interface{}{}).Optional(), // breakdown of refresh vs recurring
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the BudgetForecast.
func (BudgetForecast) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("budget_forecasts").
			Unique().
			Required(),
	}
}
