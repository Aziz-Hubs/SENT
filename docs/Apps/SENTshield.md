# **SENTshield – GRC & Compliance Manager**

**Division:** SENTsec (Security)  
**Architecture:** Policy Engine (Ent + Maroto PDF)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTshield simplifies the complex world of Governance, Risk, and Compliance (GRC). It replaces spreadsheets and disjointed Word documents with a structured platform for managing compliance frameworks (ISO 27001, SOC 2, HIPAA, GDPR). It automates the evidence collection process, saving hundreds of hours during audits.

## **2. Technical Architecture**

### **2.1 The Policy Engine**
*   **Mapping:** Many-to-Many mapping of "Controls" to "Frameworks". (e.g., "Password Complexity" satisfies both NIST and ISO requirements).
*   **Evidence Linking:** Links "Proof" (screenshots, logs, configs) to specific controls.

### **2.2 The Document Generator**
*   **Engine:** **Maroto** (Go PDF Library).
*   **Output:** Generates pixel-perfect, watermarked PDF reports for auditors.

## **3. Core Features**

### **3.1 Framework Management**
*   **Pre-loaded Templates:** Comes with standard templates for NIST CSF, CIS Controls, HIPAA, GDPR, and PCI-DSS.
*   **Gap Analysis:** Visual dashboard showing compliance percentage (e.g., "78% compliant with SOC 2").

### **3.2 Automated Evidence Collection**
*   **Connectors:** Queries SENTpulse and SENTcontrol to automatically satisfy controls.
    *   *Control:* "All laptops must have encryption."
    *   *Check:* SENTshield queries SENTpulse -> "BitLocker Enabled on 100% of devices" -> *Status:* PASS.

### **3.3 Vendor Risk Management**
*   **Questionnaires:** Send digital assessment forms to 3rd party vendors.
*   **Scoring:** auto-calculates risk scores based on vendor responses.

### **3.4 Risk Register**
*   **Tracking:** Centralized registry of identified business risks, impact, probability, and mitigation plans.

## **4. Integration with SENT Ecosystem**
*   **SENTnexus:** Links policies to specific assets or departments.
*   **SENTmind:** Verifies that "Security Awareness Training" controls are met.

## **6. Expanded Integration Scenarios**
*   **SENTmission (Projects):** "Audit Project". Creates a project in SENTmission for the annual ISO audit, with tasks assigned to department heads.
*   **SENTscribe (Wiki):** Policies written in SENTshield are automatically published to the SENTscribe Employee Handbook as read-only pages.
*   **SENTpilot:** "Policy Violation". If a user violates a policy (e.g., installing banned software), a ticket is created and linked to the compliance record.
*   **SENTvault:** Stores the final signed Audit Reports securely with a "Legal Hold" retention policy.

## **7. Future Feature Roadmap**
*   **AI Policy Writer:** "Draft a BYOD policy for a healthcare company". The LLM generates the text.
*   **Evidence Expiration:** Alerts when manual evidence (e.g., a pen test report) is >1 year old and needs refreshing.
*   **Whistleblower Portal:** A secure, anonymous form for employees to report compliance violations.
*   **GDPR "Right to be Forgotten" Automation:** Orchestrates data deletion across all SENT apps when a request is received.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Manual Checklist for one framework (NIST).
*   **In-Scope:**
    *   Framework Import (CSV/JSON).
    *   Control List View.
    *   Status Toggling (Not Started / In Progress / Compliant).
    *   Manual Evidence Upload (File attachment).
    *   Risk Register (CRUD).
*   **Out-of-Scope (Phase 2):**
    *   Automated Evidence Collection.
    *   PDF Report Generation.
    *   Vendor Portals.


## **10. Technical Design Document (TDD)**

### **10.1 Architectural Infrastructure**
This module is a high-performance component of the **SENT Unified Monolith**, leveraging a single-binary distribution strategy for cross-platform deployment (Windows, macOS, Linux).
*   **Core Engine:** Compiled **Go 1.24+** backend utilizing a modular service architecture.
*   **UI Layer:** **React 19** frontend served via **Wails v2**, ensuring native performance with web-standard styling (Tailwind CSS).
*   **State Management:** Lightweight, high-performance state handling using **Zustand** and **Immer**.
*   **Communication:** Internal function-call routing for inter-app telemetry and **Centrifugo** for real-time WebSocket events.

### **10.2 Data Persistence & Schema**
*   **Relational Model:** **PostgreSQL** with **Ent ORM** for strictly-typed, graph-aware relationship management.
*   **Time-Series Core:** Integrated **TimescaleDB** hypertables for performance-critical metrics and high-volume audit logs.
*   **Caching Strategy:** Multi-level caching using in-memory Go maps and **Redis** for distributed state across the monolith's worker nodes.

### **10.3 Module-Specific Engineering**
* **GRC Engine:** Automated compliance gap analysis (ISO 27001, GDPR, NIST).
* **Reporting:** High-fidelity PDF generation using the **Maroto** library.
* **Risk Management:** Vendor risk assessment questionnaires and risk scoring logic.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Used by the CISO office to maintain SENT's corporate compliance posture.
*   **Inter-App Synergy:** Real-time data sharing with other SENT modules (e.g., **SENTvault** for file persistence, **SENTchat** for alerts) via the centralized internal message bus.

### **10.5 Security, Compliance & Audit**
*   **Identity:** Unified authentication via **Zitadel** (OIDC), enforcing granular Role-Based Access Control (RBAC).
*   **Protection:** Mandatory **AES-256-GCM** encryption for all sensitive fields at rest and **TLS 1.3** for all internal and external communication.
*   **Auditability:** Every transaction is recorded in an immutable audit hypertable, including the actor, delta, and cryptographic hash for non-repudiation.

### **10.6 Performance & Lifecycle Management**
*   **Scalability:** Stateless horizontal scaling of worker processes, managed by the core SENT scheduler.
*   **Observability:** Full-stack tracing via **OpenTelemetry** and real-time health monitoring via **Prometheus** endpoints.
*   **CI/CD:** Automated testing suites (Unit, Integration, E2E) required for every build, ensuring 99.99% system uptime.

## **11. Engineering Requirements & Quality Assurance**

### **11.1 Key Engineering Goals**
Developers must prioritize the following objectives to ensure the module meets SENT's enterprise standards:
*   **Goal:** Ensure seamless integration with the SENTcore unified data bus.
*   **Goal:** Deliver a polished, 'Native-feeling' UI experience with zero lag.

### **11.2 Mandatory Testing Suite**
No code will be merged into the SENTcore main branch without 100% passing of the following:
*   **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
*   **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
*   **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
*   **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
*   **Spec:** Validate all CRUD operations against the Ent schema.
*   **Spec:** Verify state consistency across multiple app windows.

### **11.3 Performance & Reliability Benchmarks**
The following KPIs must be validated during the CI/CD pipeline:
*   **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
*   **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
*   **KPI:** App boot time < 1s.
*   **KPI:** UI thread frame rate > 60FPS.

### **11.4 Quality Assurance & Compliance Verification**
*   **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
*   **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
*   **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
