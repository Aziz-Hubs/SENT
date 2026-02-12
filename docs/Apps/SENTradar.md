# **SENTradar – SIEM & Log Analysis**

**Division:** SENTsec (Security)  
**Architecture:** Log Aggregator (Go + Expr + Sigma)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTradar is the central nervous system of the SENTsec division. It is a Security Information and Event Management (SIEM) platform built for speed and simplicity. Unlike traditional SIEMs (Splunk, Elastic) that require massive clusters to query data, SENTradar uses a highly optimized Go-based ingestion engine and "Sigma" rules to detect threats in real-time with minimal latency.

## **2. Technical Architecture**

### **2.1 The Collector**
*   **Ingestion:** Acts as a Syslog server (UDP/TCP 514) and Windows Event Collector.
*   **Normalization:** Converts disparate log formats (JSON, CSV, raw text) into a unified "SENT Event Schema".

### **2.2 The Detection Engine**
*   **Logic:** Uses **Expr** (Expression Language for Go) to evaluate logs against detection rules.
*   **Standard:** Native support for **Sigma Rules** (Generic Signature Format for SIEM Systems), allowing immediate usage of thousands of open-source threat detection rules.

### **2.3 Data Store**
*   **Hot Storage:** TimescaleDB for recent logs (searchable < 10ms).
*   **Cold Storage:** Compressed Parquet files on S3/Local Disk for long-term compliance retention.

## **3. Core Features**

### **3.1 Real-Time Threat Detection**
*   **Correlation:** Detects patterns across multiple sources (e.g., "5 Failed Logins on Server A" + "Successful Admin Login on Server B").
*   **Rule Management:** Git-integrated rule repository. Pulls updates from the community Sigma repo automatically.

### **3.2 Forensic Search**
*   **Query Language:** A simplified SQL-like syntax for hunting (e.g., `user="admin" AND ip NOT IN (trusted_subnets)`).
*   **Timeline:** Interactive histogram showing event volume over time to identify spikes (DDoS, Brute Force).

### **3.3 Entity Behavior Analytics (UEBA)**
*   **Baselines:** Learns "normal" behavior (e.g., "User Bob logs in from London at 9 AM").
*   **Anomalies:** Flags deviations (e.g., "User Bob logged in from Pyongyang at 3 AM").

## **4. Integration with SENT Ecosystem**
*   **SENTreflex:** Triggers automated playbooks when high-severity alerts are fired.
*   **SENTpilot (Sec):** Creates a security incident ticket for analyst investigation.
*   **SENTpulse:** Deploys the log shipping agent to endpoints.

## **6. Expanded Integration Scenarios**
*   **SENTpeople (HR):** "Insider Threat". Correlates "Notice of Resignation" from HR with "Large File Download" events on the user's laptop.
*   **SENTgrid (Network):** Ingests firewall logs to match "Denied Traffic" spikes with "Endpoint Malware" events.
*   **SENTcontrol (SaaS):** Correlates "Impossible Travel" (Login from NY and Tokyo in 1 hour) across M365 and Local Windows Logins.
*   **SENToptic:** "Physical Correlation". If a "Door Forced Open" event is logged by access control, SENTradar pulls the camera log.

## **7. Future Feature Roadmap**
*   **AI Hunter:** An LLM-based assistant that can write queries for you (e.g., "Show me all logins from Russia last week").
*   **Dark Web Monitor:** Automatically search for company domain credentials in breached databases.
*   **Graph Visualizer:** A "Threat Graph" showing the attack path (User -> Phishing Email -> Malware -> C2 Server).
*   **Retro-Hunting:** When a new Rule is added, automatically re-scan the last 30 days of cold storage to see if we missed it.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Ingest logs and run simple keyword matches.
*   **In-Scope:**
    *   Syslog Listener (UDP 514).
    *   Basic Parser (JSON/Text).
    *   Log Storage (Postgres/Timescale).
    *   Search UI (Filter by Time, Host, Message).
    *   Basic Alerting (If message contains "Error", email Admin).
*   **Out-of-Scope (Phase 2):**
    *   Sigma Rule Engine.
    *   Correlation Logic.
    *   UEBA.
    *   Cold Storage Archiving.


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
* **SIEM Engine:** High-velocity log aggregation with **Sigma rule** matching.
* **Search Engine:** Forensic timeline search optimized by **Expr** boolean logic.
* **Normalization:** Common Event Schema mapping for disparate log sources.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Monitors all internal security logs and network traffic for threat detection.
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
