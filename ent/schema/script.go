package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Script holds the schema definition for the Script entity.
type Script struct {
	ent.Schema
}

// Fields of the Script.
func (Script) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Unique(),
		field.String("description").Optional(),
		field.Text("content"), // The actual script code
		field.Enum("type").Values("ps1", "sh"),
		field.JSON("parameters", []string{}).Optional(), // List of parameter names
        field.Time("created_at").Default(time.Now),
        field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Edges of the Script.
func (Script) Edges() []ent.Edge {
	return []ent.Edge{
        edge.From("tenant", Tenant.Type).
            Ref("scripts").
            Unique().
            Required(),
		edge.To("jobs", Job.Type),
	}
}
