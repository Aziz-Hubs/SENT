package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
	"time"
)

// StrategicRoadmap holds the schema definition for the StrategicRoadmap entity.
type StrategicRoadmap struct {
	ent.Schema
}

// Fields of the StrategicRoadmap.
func (StrategicRoadmap) Fields() []ent.Field {
	return []ent.Field{
		field.String("project_name"),
		field.String("description").Optional(),
		field.Enum("priority").Values("LOW", "MEDIUM", "HIGH", "CRITICAL").Default("MEDIUM"),
		field.Enum("status").Values("PLANNED", "APPROVED", "IN_PROGRESS", "COMPLETED").Default("PLANNED"),
		field.Other("estimated_cost", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.Zero),
		field.Time("target_date"),
		field.String("strategic_commentary").Optional(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the StrategicRoadmap.
func (StrategicRoadmap) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).
			Ref("roadmaps").
			Unique().
			Required(),
	}
}
