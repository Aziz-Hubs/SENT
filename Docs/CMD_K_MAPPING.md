# [CMD_K_MAPPING] - Global Search Synchronization

Verification of categorical search results across the SENT Ecosystem.

## 1. Categorization Schema
The Omnibar (Cmd+K) now maps results into the following buckets:

### Infrastructure (MSP)
- **SENTpulse:** Real-time RMM & Telemetry.
- **SENTnexus:** Documentation & Asset Graph.
- **SENToptic:** NVR & AI Surveillance.
- **SENTgrid:** Network Orchestration.
- **SENTpilot:** ITSM & Ticketing.
- **SENThorizon:** vCIO Strategy.
- **SENTcontrol:** SaaS Governance.
- **SENTwave:** Cloud VoIP.

### Business (ERP)
- **SENTpeople:** HRIS & Payroll.

## 2. Navigation Triggers
- **Action:** `setDivision(id)`
- **Behavior:** Closes Omnibar, switches workspace, resets Context Sidebar.

## 3. Future Backend Integration (TSVector)
The frontend is ready to receive `CategorizedResult[]` from the Go kernel via `SearchEcosystem(query)`.
