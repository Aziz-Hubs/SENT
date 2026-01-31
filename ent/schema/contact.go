package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/shopspring/decimal"
	"time"
)

// Contact holds the schema definition for the Contact entity.
type Contact struct {
	ent.Schema
}

// Fields of the Contact.
func (Contact) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty().Comment("Full name of the contact"),
		field.String("email").Optional().Comment("Email address"),
		field.String("phone").Optional().Comment("Phone number"),
		field.String("address").Optional().Comment("Physical address"),
		field.String("type").Default("customer").Comment("Type: customer, lead, vendor, etc."),
		
		// Loyalty Fields
		field.Int("loyalty_points").Default(0).Comment("Current loyalty points balance"),
		field.Other("lifetime_value", decimal.Decimal{}).
			SchemaType(map[string]string{
				"postgres": "numeric(19,4)",
			}).
			Default(decimal.Zero).
			Comment("Total value of all purchases made by this contact"),
			
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

// Indexes of the Contact.
func (Contact) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("email").Edges("tenant").Unique(),
		index.Fields("phone").Edges("tenant"),
	}
}

// Edges of the Contact.
func (Contact) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("contacts").Unique().Required(),
	}
}
