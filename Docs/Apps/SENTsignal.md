# **SENTsignal – Threat Intelligence Platform**

**Division:** SENTsec (Security)  
**Architecture:** Data Aggregator & Feeds  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTsignal is the knowledge base of the enemy. It aggregates Threat Intelligence (TI) from open sources, commercial feeds, and the SENT community to provide context to security alerts. It ensures that the ecosystem is protected against the latest Indicators of Compromise (IoCs).

## **2. Technical Architecture**

### **2.1 The Aggregator**
*   **Format:** STIX/TAXII standards for exchanging threat info.
*   **Database:** Graph-based storage for linking Actors -> Tools -> IPs -> Hashes.

## **3. Core Features**

### **3.1 Feed Management**
*   **Sources:** Ingests data from AlienVault OTX, MISP, PhishTank, and proprietary SENT research.
*   **Confidence Scoring:** Algorithms to decay old indicators (e.g., an IP that was malicious 6 months ago might be safe now).

### **3.2 Ecosystem Sync**
*   **Blocklists:** Pushes "High Confidence" malicious IPs to SENTgrid (Firewalls) and SENTguard (Endpoints) for preemptive blocking.
*   **Retrospective Search:** When a new indicator is added, it triggers a search in SENTradar to see if *past* logs match the new threat.

## **4. Integration with SENT Ecosystem**
*   **SENTradar:** Enriches logs with reputation data.
*   **SENTreflex:** Used for automated decision making (e.g., "If reputation > 90/100, Block immediately").

## **6. Expanded Integration Scenarios**
*   **SENTmail:** "Spam Filter". Feeds malicious domains to the SENTmail server to block incoming spam.
*   **SENTprobe:** "Target List". If a new vulnerability is trending (e.g., in a specific VPN), SENTsignal tells SENTprobe to scan all clients for that specific CVE immediately.
*   **SENTaccess:** "Client Alert". Posts a "Security Advisory" to the client portal if a major global threat (like WannaCry) is active.
*   **SENTshield:** "Risk Assessment". Updates the risk register if a vendor used by the company is compromised (Supply Chain Intel).

## **7. Future Feature Roadmap**
*   **Dark Web Scraper:** Monitors underground forums for mentions of the company name.
*   **Brand Protection:** Detects typosquatting domains (e.g., `sent-support.com`) and issues takedown requests.
*   **TTP Mapping:** Maps indicators to the MITRE ATT&CK framework.
*   **Sharing Group:** Allow SENT users to anonymously share intel with each other (Community Defense).

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Aggregate simple IP/Domain blocklists.
*   **In-Scope:**
    *   Fetch feed from URL (TXT/CSV).
    *   Parse IP/Domain/Hash.
    *   Search UI (Check if IP is bad).
    *   API for other apps to query.
*   **Out-of-Scope (Phase 2):**
    *   STIX/TAXII support.
    *   Graph Database.
    *   Retrospective Search.


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
* **Threat Intel:** Automated STIX/TAXII feed ingestion and confidence scoring.
* **Protection:** Pushes blocklists to SENTgrid and SENTguard in real-time.
* **Hunting:** Retrospective log searching for newly identified indicators.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The central repository for all security indicators of compromise within SENT.
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
