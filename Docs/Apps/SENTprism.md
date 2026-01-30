# **SENTprism – Business Intelligence (BI)**

**Division:** SENTerp (Business)  
**Architecture:** Analytics Engine (DuckDB / ClickHouse)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTprism converts data into decisions. It is a Business Intelligence platform that connects to all SENT apps (and external SQL sources) to provide cross-departmental dashboards. It replaces PowerBI or Tableau.

## **2. Technical Architecture**

### **2.1 The Query Engine**
*   **OLAP:** Utilizes embedded **DuckDB** for fast analytical queries on local data, or connects to ClickHouse for big data.
*   **Caching:** In-memory caching of query results.

## **3. Core Features**

### **3.1 Visualization**
*   **Dashboards:** Drag-and-drop canvas with 30+ widget types (Bar, Line, Pie, Map, KPI Card).
*   **Interactivity:** Drill-down capabilities (Click a bar -> see the underlying rows).

### **3.2 Data Modeling**
*   **ETL:** Light Extract-Transform-Load capabilities to join tables (e.g., Join "Sales" from SENTorbit with "Hours" from SENTmission).
*   **Calculated Fields:** Excel-like formulas for creating custom metrics.

### **3.3 Distribution**
*   **Alerts:** "Notify me via SENTchat if Monthly Revenue drops below $50k".
*   **Reports:** Scheduled email PDF exports.

## **4. Integration with SENT Ecosystem**
*   **SENTdeck:** Dashboards can be embedded live into presentation slides.
*   **SENTexec:** The "CEO Dashboard" is powered by Prism.

## **6. Expanded Integration Scenarios**
*   **SENTkiosk:** "Leaderboard". Display a sales leaderboard on a TV in the office.
*   **SENTpulse:** "NOC View". Aggregate stats from 10,000 agents into a global health map.
*   **SENTaccess:** "Client Reporting". Embed read-only dashboards into the client portal for transparency.
*   **SENTcapital:** "Budget vs Actual". Real-time gauge showing spending against the budget.

## **7. Future Feature Roadmap**
*   **Natural Language Query (NLQ):** "Show me sales by region for last month" -> Generates SQL.
*   **Mobile App:** Optimized view for viewing KPIs on the go.
*   **Data Marketplace:** Import public datasets (e.g., Census data, Weather history) to overlay on business data.
*   **Predictive Analytics:** Forecasting trend lines.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Visualize internal database queries.
*   **In-Scope:**
    *   Postgres Connector (Read-only).
    *   SQL Editor (Write query).
    *   Chart Library (Bar/Line/Table).
    *   Dashboard Canvas (Grid layout).
    *   Auto-refresh.
*   **Out-of-Scope (Phase 2):**
    *   Drag-and-Drop Query Builder (No-Code).
    *   External Data Sources (CSV/API).
    *   Drill-down.
    *   Alerting.


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
* **BI Engine:** Multi-source data aggregator with interactive dashboard rendering.
* **Querying:** SQL-based analytics engine with pre-built SENTcore KPI templates.
* **Distribution:** Scheduled report delivery via SENTchat and SENTmail.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Provides the Executive Office with real-time company-wide performance dashboards.
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
