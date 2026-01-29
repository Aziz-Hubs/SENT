package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// SaaSUsage holds the schema definition for the SaaSUsage entity.
type SaaSUsage struct {
	ent.Schema
}

// Fields of the SaaSUsage.
func (SaaSUsage) Fields() []ent.Field {
	return []ent.Field{
		field.Time("timestamp").Default(time.Now),
		field.String("feature_name").NotEmpty(),
		field.Int("count").Default(1),
		field.JSON("metadata", map[string]interface{}{}).Default(map[string]interface{}{}),
	}
}

// Edges of the SaaSUsage.
func (SaaSUsage) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("identity", SaaSIdentity.Type).Ref("usages").Unique().Required(),
	}
}
