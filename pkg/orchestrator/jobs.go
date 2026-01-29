package orchestrator

// TerminationArgs initiates the offboarding sequence for an employee.
type TerminationArgs struct {
	TenantID   int    `json:"tenant_id"`
	UserID     int    `json:"user_id"`
	ActorID    string `json:"actor_id"`
	ManagerID  *int   `json:"manager_id"`
}

func (TerminationArgs) Kind() string { return "lifecycle.termination" }

// RevokeSaaSArgs handles the revocation of cloud licenses.
type RevokeSaaSArgs struct {
	TenantID int    `json:"tenant_id"`
	UserID   int    `json:"user_id"`
	Platform string `json:"platform"` // "m365", "google"
}

func (RevokeSaaSArgs) Kind() string { return "control.revoke_saas" }

// AssetCleanupArgs handles unassigning hardware from a user.
type AssetCleanupArgs struct {
	TenantID int `json:"tenant_id"`
	UserID   int `json:"user_id"`
}

func (AssetCleanupArgs) Kind() string { return "nexus.asset_cleanup" }

// CallRedirectionArgs handles extension forwarding in the VoIP system.
type CallRedirectionArgs struct {
	TenantID     int `json:"tenant_id"`
	UserID       int `json:"user_id"`
	TargetUserID int `json:"target_user_id"`
}

func (CallRedirectionArgs) Kind() string { return "wave.call_redirection" }

// IncidentResponseArgs handles self-healing for infrastructure failures.
type IncidentResponseArgs struct {
	TenantID   int    `json:"tenant_id"`
	SourceApp  string `json:"source_app"` // "pulse", "optic"
	DeviceID   int    `json:"device_id"`
	AlertName  string `json:"alert_name"`
	Details    string `json:"details"`
}

func (IncidentResponseArgs) Kind() string { return "pilot.incident_response" }

// HealthUpdateArgs recalculates tenant health scores.
type HealthUpdateArgs struct {
	TenantID int `json:"tenant_id"`
}

func (HealthUpdateArgs) Kind() string { return "horizon.health_update" }

// OCRArgs extracts text from a file in the vault.
type OCRArgs struct {
	VaultItemID int    `json:"vault_item_id"`
	Hash        string `json:"hash"`
}

func (OCRArgs) Kind() string { return "vault.ocr" }

// SecurityAuditEvent represents a high-integrity event for auditing (e.g. POS No Sale).
type SecurityAuditEvent struct {
	Type      string `json:"type"` // no_sale, manager_override
	KioskID   int    `json:"kioskId"`
	Timestamp int64  `json:"timestamp"`
	ActorID   string `json:"actorId"`
}

// BillingSyncArgs handles the transition from Work Performed to Revenue Recognized.
type BillingSyncArgs struct {
	TimeEntryID int `json:"time_entry_id"`
}

func (BillingSyncArgs) Kind() string { return "pilot.billing_sync" }