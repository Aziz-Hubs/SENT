# **SENTscribe – Wiki & Knowledge Management**

**Division:** SENTerp (Business)  
**Architecture:** Rich Text Editor  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTscribe is the corporate memory. It is a hierarchical document management system for creating Employee Handbooks, Standard Operating Procedures (SOPs), and Meeting Notes. It mimics the block-based editing experience of Notion.

## **2. Technical Architecture**

### **2.1 The Editor**
*   **Frontend:** Block-based editor (e.g., Editor.js or Tiptap customized).
*   **Format:** Stores data as structured JSON, not just HTML, allowing for dynamic content embedding.

## **3. Core Features**

### **3.1 Dynamic Content**
*   **Embeds:** Insert live data from other apps (e.g., a live chart from SENThorizon, a contact card from SENTorbit).
*   **Code Blocks:** Syntax highlighting for developers.

### **3.2 Organization**
*   **Hierarchy:** Infinite nesting of pages.
*   **Backlinks:** See what other pages link to the current page.

### **3.3 Collaboration**
*   **Multi-player:** Real-time co-editing (Google Docs style) using CRDTs (Conflict-free Replicated Data Types).
*   **Comments:** Inline commenting and task assignment.

## **4. Integration with SENT Ecosystem**
*   **SENTnexus:** The IT-specific documentation engine (Nexus) uses Scribe's editor core but adds structured asset fields.
*   **SENTmission:** Project specs are written in Scribe.

## **6. Expanded Integration Scenarios**
*   **SENTchat:** "Wiki Unfurl". Pasting a Scribe link in chat shows a preview of the content.
*   **SENTpeople:** "Policy Acknowledgement". Require users to scroll to the bottom of a Scribe page (e.g., "New HR Policy") and click "I Agree".
*   **SENTdeck:** "Convert to Slides". AI turns a structured Scribe document into a SENTdeck presentation.

## **7. Future Feature Roadmap**
*   **AI Writer:** "Expand this paragraph" or "Change tone to professional".
*   **Database Tables:** Inline databases with filter/sort (Notion style).
*   **Offline Mode:** Edit documents without internet; syncs when back online.
*   **Template Gallery:** Community shared templates for Meeting Notes, PRDs, etc.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Create and edit hierarchical documents.
*   **In-Scope:**
    *   Rich Text Editor (Bold, Italic, H1-H3).
    *   Image Upload.
    *   Page Tree Structure (Sidebar).
    *   Read/Write Permissions.
    *   PDF Export.
*   **Out-of-Scope (Phase 2):**
    *   Real-time Co-editing.
    *   Live Embeds.
    *   Database Tables.


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
* **Wiki Core:** Block-based collaborative editor for SOPs and employee handbooks.
* **Intelligence:** Automatic backlinking and contextual asset @mentions from SENTnexus.
* **Publishing:** Version-controlled documentation with approval workflows.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Hosts the official SENT Employee Handbook and internal Wiki.
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
