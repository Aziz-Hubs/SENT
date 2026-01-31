package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/shopspring/decimal"
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
		field.Other("transaction_limit", decimal.Decimal{}).
			SchemaType(map[string]string{
				dialect.Postgres: "numeric(19,4)",
			}).
			Default(decimal.NewFromFloat(1000.0)),
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
		edge.To("vault_share_links", VaultShareLink.Type),
		edge.To("journal_entries", JournalEntry.Type),
		edge.To("recurring_invoices", RecurringInvoice.Type),
		edge.To("inventory_reservations", InventoryReservation.Type),
		edge.To("departments", Department.Type),
		edge.To("permissions", Permission.Type),
		edge.To("asset_types", AssetType.Type),
		edge.To("detection_events", DetectionEvent.Type),
		edge.To("saas_identities", SaaSIdentity.Type),
		edge.To("saas_usages", SaaSUsage.Type),
		edge.To("recordings", Recording.Type),
		edge.To("network_links", NetworkLink.Type),
		edge.To("network_ports", NetworkPort.Type),
		edge.To("nexus_audits", NexusAudit.Type),
		edge.To("succession_maps", SuccessionMap.Type),
		edge.To("customer_account", Account.Type).
			Unique(),
		edge.To("scripts", Script.Type),
		edge.To("jobs", Job.Type),
		edge.To("time_off_requests", TimeOffRequest.Type),
		edge.To("time_off_policies", TimeOffPolicy.Type),
		edge.To("time_off_balances", TimeOffBalance.Type),
		edge.To("review_cycles", ReviewCycle.Type),
		edge.To("performance_reviews", PerformanceReview.Type),
		edge.To("goals", Goal.Type),
		edge.To("suppliers", Supplier.Type),
		edge.To("categories", Category.Type),
		edge.To("warehouses", Warehouse.Type),
		edge.To("asset_assignments", AssetAssignment.Type),
		edge.To("contacts", Contact.Type),
		edge.To("legal_holds", LegalHold.Type),
		edge.To("retention_policies", RetentionPolicy.Type),
		edge.To("vault_templates", VaultTemplate.Type),
		edge.To("stock_audit_logs", StockAuditLog.Type),
		edge.To("maintenance_schedules", MaintenanceSchedule.Type),
		edge.To("stock_alerts", StockAlert.Type),
		edge.To("purchase_orders", PurchaseOrder.Type),
		edge.To("inventory_counts", InventoryCount.Type),
		edge.To("job_postings", JobPosting.Type),
		edge.To("candidates", Candidate.Type),
		edge.To("applications", Application.Type),
		edge.To("interviews", Interview.Type),
		edge.To("benefit_plans", BenefitPlan.Type),
		edge.To("benefit_enrollments", BenefitEnrollment.Type),
	}
}
