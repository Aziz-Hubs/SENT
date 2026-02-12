# **SENTaccess – Client Portal**

**Division:** SENTerp (Business)  
**Architecture:** PWA (Progressive Web App)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTaccess is the window for the customer. It is a unified web portal where external clients log in to interact with the business. It aggregates data from all other SENT apps into a customer-facing view.

## **2. Technical Architecture**

### **2.1 The Gateway**
*   **Security:** Rigid Role-Based Access Control (RBAC) to ensure clients only see their own data.
*   **Tech:** React-based PWA that can be installed on client mobile devices.

## **3. Core Features**

### **3.1 Ecosystem Governance**
*   **Organization Manager:** Centralized interface for managing all **Tenants** within the SENT kernel. Supports activation, suspension, and domain mapping.
*   **User Directory:** Global view of all users across the ecosystem with organization-level filtering and role management.
*   **Multi-tenant Isolation:** Strict data fencing logic enforced at the bridge level to prevent cross-tenant data leakage.

### **3.2 System Intelligence**
*   **Global Telemetry:** Real-time summary cards displaying the total count of registered organizations and global user footprint.
*   **Kernel Logs:** Integrated low-latency console for viewing real-time system events from the **SENTd Kernel**, including Bridge binding, Auth validation, and GC events.
*   **Theme Control:** Native support for dynamic Dark/Light mode switching, propagated across the entire UI singleton.

### **3.3 Knowledge & Self-Service**
*   **Wiki:** Access public/shared articles from SENTnexus/SENTscribe.
*   **Profile Management:** Direct integration with **Zitadel** for secure password resets and MFA configuration.

## **4. Integration with SENT Ecosystem**
*   **SENTcore:** The administrative division acts as the master controller for the unified monolith's shared database.
*   **SENTpilot:** High-level view of ticket volumes across all managed organizations.
*   **SENTvault:** Global management of storage quotas and archival history.

## **6. Expanded Integration Scenarios**
*   **SENTsheet:** "Shared Reports". Clients can view specific SENTsheets shared with them (e.g., "Monthly Metrics").
*   **SENTvault:** "Data Room". Secure place to upload confidential documents during onboarding.
*   **SENTwave:** "Web Phone". Client can click "Call Support" to make a VoIP call directly from the browser.
*   **SENTpeople:** "Directory". Client can see a list of their account management team and their contact info.

## **7. Future Feature Roadmap**
*   **White Labeling:** Allow the MSP to put their own logo and domain (`portal.my-msp.com`).
*   **SSO:** Allow clients to login using their own Microsoft 365 or Google credentials.
*   **Push Notifications:** Send alerts to the client's phone (e.g., "Tech arriving in 5 mins").
*   **Custom Pages:** Allow the MSP to build custom pages using SENTcanvas logic inside the portal.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Client can view tickets and invoices.
*   **In-Scope:**
    *   Login/Logout.
    *   Ticket List (View/Create/Reply).
    *   Invoice List (View PDF).
    *   Profile Management (Change Password).
*   **Out-of-Scope (Phase 2):**
    *   Online Payments.
    *   Knowledge Base.
    *   Quote Approvals.
    *   Mobile PWA features.




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
* **Portal Core:** Unified client-facing gateway for ticketing and billing self-service.
* **Security:** Strict multi-tenant data isolation with role-based access.
* **Experience:** Installable PWA with push notifications for ticket updates.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The window for external clients to interact with SENT LLC services.
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
