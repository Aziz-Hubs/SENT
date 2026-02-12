# **SENTreflex – SOAR & Automation**

**Division:** SENTsec (Security)  
**Architecture:** Job Queue (River) + Scripting  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTreflex is the "Digital Responder" of the security division. It is a Security Orchestration, Automation, and Response (SOAR) platform. Its purpose is to execute pre-defined playbooks at machine speed to contain threats before a human analyst can even open a ticket.

## **2. Technical Architecture**

### **2.1 The Execution Engine**
*   **Queue:** **River** (Postgres-backed Job Queue for Go) for reliable, transactional task execution.
*   **Workers:** Isolated worker processes that execute Go plugins or scripts.

### **2.2 The Playbook Builder**
*   **UI:** Visual flowchart editor (React Flow) for designing logic (If -> Then -> Else).

## **3. Core Features**

### **3.1 Automated Containment**
*   **Account Lockout:** Connects to Active Directory / Azure AD to disable compromised users.
*   **Network Isolation:** Instructs SENTpulse/SENTguard to isolate a host from the network.
*   **Firewall Block:** Adds malicious IPs to the blocklist of perimeter firewalls via SENTgrid.

### **3.2 Enrichment**
*   **Intel Lookup:** Automatically queries VirusTotal, AbuseIPDB, and SENTsignal for reputation data on IPs/Hashes found in alerts.
*   **Context:** Fetches user details from SENTpeople (HR) to see if a "suspicious login" belongs to a VIP or a terminated employee.

### **3.3 Case Management Helpers**
*   **Communication:** Creates specific Slack/SENTchat channels for major incidents.
*   **Reporting:** Compiles timeline of automated actions for the post-incident report.

## **4. Integration with SENT Ecosystem**
*   **SENTradar:** The primary trigger for Reflex playbooks.
*   **SENTpilot (Sec):** Updates incident tickets with the results of automation (e.g., "User disabled successfully").

## **6. Expanded Integration Scenarios**
*   **SENTmail:** "Phishing Triage". If a user reports an email, Reflex parses the headers, checks the links, deletes the email from all inboxes if malicious, and notifies the user.
*   **SENTwave:** "Urgent Notification". If a Critical Severity incident occurs at 3 AM, Reflex triggers an automated phone call to the On-Call Engineer.
*   **SENTnexus:** "Credential Rotation". If a breach is suspected, Reflex forces a password reset on critical assets stored in the vault.
*   **SENTkiosk:** "Lockdown Mode". In a physical security event, Reflex locks SENTkiosk screens to prevent use.

## **7. Future Feature Roadmap**
*   **"Human in the Loop" Gates:** Pause execution and wait for an analyst to click "Approve" via SMS/Chat before taking destructive action (e.g., wiping a server).
*   **Playbook Marketplace:** Community-shared playbooks for common scenarios.
*   **Machine Learning Decisioning:** "Reflex AI" suggests the next step based on historical success rates.
*   **Multi-Tenant Orchestration:** Run a playbook across 50 different client environments simultaneously.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Trigger a script based on a Webhook.
*   **In-Scope:**
    *   Webhook Listener.
    *   Script Repository (Bash/Python).
    *   Job Queue.
    *   Execution Log (Success/Fail).
    *   Basic Email Notification.
*   **Out-of-Scope (Phase 2):**
    *   Visual Drag-and-Drop Builder.
    *   Wait/Pause Logic.
    *   External API Connectors (VirusTotal).


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
* **SOAR Engine:** **River-based** job queue for high-velocity security automation.
* **Containment:** Automated account lockout and network isolation playbooks.
* **Enrichment:** Automated intel lookups for rapid incident triage.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Executes automated response playbooks for SENT's security incidents.
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
