# **SENTnexus – IT Documentation & Knowledge Base**

**Division:** SENTmsp (Infrastructure)  
**Architecture:** Graph Database / Wiki (Ent Graph + Zitadel Vault)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**
SENTnexus is the "Brain" of the IT operation. It is a structured documentation platform designed to eliminate tribal knowledge. Unlike static wikis, SENTnexus is a dynamic "living" system where documentation is updated automatically by the RMM (SENTpulse) and linked deeply to the ticketing system (SENTpilot). It handles secure credential storage, network mapping, and standard operating procedures (SOPs).

## **2. Technical Architecture**

### **2.1 The Data Structure**
*   **Graph Model:** Utilizes **Ent**'s graph capabilities to map complex dependencies (e.g., "Server A" *hosts* "Virtual Machine B" *which runs* "SQL Database C").
*   **Security:** Field-level encryption for sensitive data (passwords, API keys) using AES-256.

### **2.2 The Security Vault**
*   **Integration:** Deep integration with **Zitadel** for access control.
*   **Audit:** "Break Glass" logging – every time a password is viewed, it is logged with a timestamp and user ID.

## **3. Core Features**

### **3.1 Flexible Asset Management**
*   **Custom Types:** Define any asset class (e.g., SSL Certificates, Domain Names, Key Cards, Vendor Contacts).
*   **Auto-Documentation:** Syncs with SENTpulse to keep fields like "OS Version", "IP Address", and "Serial Number" up to date without human intervention.
*   **Discovery Engine:** Implemented `pkg/nexus/discovery` worker that reconciles SENTpulse telemetry. Updates to existing assets are committed automatically, while new assets trigger an **Approval Inbox** workflow.

### **3.2 Password Management**
*   **Organization:** Hierarchical password storage (Client -> Site -> Device).
*   **Sharing:** Secure, temporary **One-Time Links** for sharing credentials with external vendors or clients.
*   **Masking:** Passwords are masked by default and require an explicit "Reveal" click.
*   **Clipboard Security:** Automated **30-second Clipboard Clear** timeout enforced via the Go backend for any copied credentials.

### **3.3 Relationship Mapping**
*   **Visualizer:** Interactive node-graph visualization of network dependencies.
*   **Impact Analysis:** Clicking a "Switch" node shows all downstream devices and users that would be affected by an outage. Implemented **Recursive Blast Radius** logic (defaulting to 3-hop depth) that traverses `depends_on` and `hosted_at` relationships.

### **3.4 Knowledge Base (SOPs)**
*   **Editor:** Markdown-based editor with support for diagrams (Mermaid.js).
*   **Linking:** `@mention` assets directly within articles (e.g., "To restart the @Firewall, login with @FirewallAdmin").
*   **Governance:** **Data Certification Module** that tags assets for a **90-day verification task**, requiring owners to certify the accuracy of their Configuration Items (CIs).

## **4. Integration with SENT Ecosystem**
*   **SENTpilot:** Technicians see relevant passwords and SOPs side-by-side with tickets.
*   **SENTpulse:** Provides the raw telemetry (MAC, Hostname, OS) to populate and reconcile asset fields.
*   **SENTguard:** links security incidents to specific asset documentation.

## **8. Minimum Viable Product (MVP) Status**
*   **Status:** [GOLD_MASTER_READY]
*   **Completed Features:**
    *   **Asset Management:** Secure storage for hardware, software, and custom asset types.
    *   **Credential Vault:** Hardware-accelerated **AES-256-GCM** encryption with temporary **One-Time Links** for secure sharing.
    *   **Discovery Engine:** Implemented background worker that reconciles SENTpulse telemetry into the CMDB automatically.
    *   **Impact Analysis Engine:** **Recursive 3-hop graph traversal** logic to identify downstream blast radius for asset outages.
    *   **Data Certification:** Integrated verification module for maintaining documentation accuracy over time.

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
* **Knowledge Graph:** **Ent-based** graph database mapping complex asset dependencies.
* **Impact Engine:** **Recursive 3-hop graph traversal** logic to identify downstream outages and dependencies.
* **Credential Vault:** Hardware-accelerated **AES-256-GCM** encryption for credential storage.
* **Governance:** Implementation of **Mandatory Justification** logic; every "Reveal" request requires a **ReasonCode** which is logged immutably in the `nexusaudit` table for compliance.
* **Job Orchestration:** Utilizes **River** for the **Discovery Engine** worker and the **Data Certification** background tasks.
* **Data Certification:** Automated worker that tags stale documentation for periodic review tasks.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The central repository for all internal SENT operational knowledge and credentials.
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
* **Spec:** Validate **Recursive Blast Radius** logic (3-hop depth) against complex dependency trees.
* **Spec:** Verify **AES-GCM encryption** roundtrip for vault credentials.
* **Spec:** Test **One-Time Link** expiration and cryptographic non-reuse.

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
