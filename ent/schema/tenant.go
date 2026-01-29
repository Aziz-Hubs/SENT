package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"time"
)

// Tenant holds the schema definition for the Tenant entity.
type Tenant struct {
	ent.Schema
}

// Fields of the Tenant.
func (Tenant) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Unique(),
		field.String("domain").Unique(),
		field.Time("created_at").Default(time.Now),
		field.Bool("active").Default(true),
		field.Float("transaction_limit").Default(1000.0),
	}
}

// Edges of the Tenant.
func (Tenant) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("children", Tenant.Type).
			From("parent").
			Unique(),
		edge.To("users", User.Type),
		edge.To("accounts", Account.Type),
		edge.To("transactions", Transaction.Type),
		edge.To("ledger_entries", LedgerEntry.Type),
		edge.To("products", Product.Type),
		edge.To("stock_movements", StockMovement.Type),
		edge.To("audit_logs", AuditLog.Type),
		edge.To("agents", Agent.Type),
		edge.To("discovery_entries", DiscoveryEntry.Type),
		edge.To("assets", Asset.Type),
		edge.To("credentials", Credential.Type),
		edge.To("one_time_links", OneTimeLink.Type),
		edge.To("sops", SOP.Type),
		edge.To("cameras", Camera.Type),
		edge.To("tickets", Ticket.Type),
		edge.To("contracts", Contract.Type),
		edge.To("saas_apps", SaaSApp.Type),
		edge.To("saas_filters", SaaSFilter.Type),
		edge.To("call_logs", CallLog.Type),
		edge.To("ivr_flows", IVRFlow.Type),
		edge.To("voicemails", Voicemail.Type),
		edge.To("health_snapshots", HealthScoreSnapshot.Type),
		edge.To("roadmaps", StrategicRoadmap.Type),
		edge.To("service_rates", ServiceRate.Type),
		edge.To("network_devices", NetworkDevice.Type),
		edge.To("network_backups", NetworkBackup.Type),
		edge.To("budget_forecasts", BudgetForecast.Type),
		edge.To("employees", Employee.Type),
		edge.To("compensation_agreements", CompensationAgreement.Type),
		edge.To("vault_items", VaultItem.Type),
		edge.To("journal_entries", JournalEntry.Type),
		edge.To("recurring_invoices", RecurringInvoice.Type),
		edge.To("inventory_reservations", InventoryReservation.Type),
		edge.To("customer_account", Account.Type).
			Unique(),
	}
}
