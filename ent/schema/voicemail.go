package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Voicemail holds the schema definition for the Voicemail entity.
type Voicemail struct {
	ent.Schema
}

// Fields of the Voicemail.
func (Voicemail) Fields() []ent.Field {
	return []ent.Field{
		field.String("caller"),
		field.String("audio_path"), // Path in SENTvault
		field.String("transcription").Optional(),
		field.Time("created_at").Default(time.Now),
		field.Int("duration").Default(0), // in seconds
		field.Time("read_at").Optional(),
	}
}

// Edges of the Voicemail.
func (Voicemail) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tenant", Tenant.Type).Ref("voicemails").Unique().Required(),
		edge.From("user", User.Type).Ref("voicemails").Unique().Required(), // Recipient
	}
}
