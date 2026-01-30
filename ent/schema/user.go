package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"time"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("zitadel_id").Unique(),
		field.String("email").Unique(),
		field.String("first_name").Optional(),
		field.String("last_name").Optional(),
		field.String("job_title").Optional(),
		field.String("department").Optional(),
		field.JSON("external_mappings", map[string]interface{}{}).
			SchemaType(map[string]string{
				"postgres": "jsonb",
			}).
			Optional(),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.String("role").Default("user"),
		field.Enum("seniority").Values("junior", "expert").Default("junior"),
		field.Int("max_wip").Default(3),
	}
}

// Indexes of the User.
func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("email"),
		index.Fields("created_at"),
		index.Fields("role"),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("users").Unique().Required(),
		edge.To("permissions", Permission.Type),
		edge.To("requested_tickets", Ticket.Type),
		edge.To("assigned_tickets", Ticket.Type),
		edge.To("time_entries", TimeEntry.Type),
		edge.To("owned_assets", Asset.Type),
		edge.To("authored_sops", SOP.Type),
		edge.To("call_logs", CallLog.Type),
		edge.To("voicemails", Voicemail.Type),
		edge.To("saas_identities", SaaSIdentity.Type),
	}
}
