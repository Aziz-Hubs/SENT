# **SENTsheet – Collaborative Spreadsheets**

**Division:** SENTerp (Business)  
**Architecture:** Spreadsheet Engine (Univer)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTsheet provides high-performance spreadsheets capable of handling complex financial modeling and data analysis. It supports standard Excel formulas and file formats (.xlsx) but adds real-time collaboration and database connectivity.

## **2. Technical Architecture**

### **2.1 The Engine**
*   **Core:** **Univer** (Open Source Office Engine) integrated into React.
*   **Calculation:** Local calculation for speed; server-side calculation for heavy datasets.

## **3. Core Features**

### **3.1 Compatibility**
*   **Excel:** Full import/export support.
*   **Formulas:** Supports 400+ standard functions (VLOOKUP, SUMIFS, etc.).

### **3.2 Data Connectivity**
*   **SQL Mode:** Pull data directly from the SENT Postgres database into a sheet for analysis. (e.g., `=SQL("SELECT * FROM tickets WHERE status='open'")`).

### **3.3 Visualization**
*   **Charts:** Pivot tables and charts generated from sheet data.

## **4. Integration with SENT Ecosystem**
*   **SENTcapital:** Export financial reports to Sheet for ad-hoc modeling.
*   **SENTorbit:** Bulk import/export of contacts.

## **6. Expanded Integration Scenarios**
*   **SENTprism:** "Data Source". A specific range in a Sheet can be defined as a data source for a Prism dashboard.
*   **SENTmission:** "Time Import". Upload a CSV/Sheet of timesheets to bulk-create entries in the project system.
*   **SENTstock:** "Stock Take". Warehouse staff fill out a Sheet on a tablet; a script syncs the counts back to the inventory database.
*   **SENTmail:** "Mail Merge". Use a Sheet as the recipient list for a mass email campaign.

## **7. Future Feature Roadmap**
*   **Python in Sheets:** Write Python code instead of Excel formulas for advanced data science (like Excel's Python integration).
*   **Forms:** Generate a web form that populates rows in the sheet.
*   **Version History:** Cell-level history (See who changed this specific cell and when).
*   **Macros:** TypeScript-based automation scripts.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Edit .xlsx files.
*   **In-Scope:**
    *   Univer Engine Integration.
    *   Basic Formulas (SUM, AVG).
    *   Cell Formatting (Color, Bold).
    *   Save/Load to SENTvault.
    *   CSV Import.
*   **Out-of-Scope (Phase 2):**
    *   SQL Connectivity.
    *   Real-time Collaboration.
    *   Charts / Pivot Tables.


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
* **Spreadsheet Engine:** **Univer-based** collaborative editor with Excel (.xlsx) parity.
* **Data Links:** Live SQL-mode for pulling real-time SENTcapital data into sheets.
* **Calculation:** High-performance local calculation engine for complex financial models.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Used by the Finance team for ad-hoc financial modeling and reporting.
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
