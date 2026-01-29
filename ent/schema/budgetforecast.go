package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
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
		field.Float("projected_amount"),
		field.Float("actual_spent").Default(0),
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
