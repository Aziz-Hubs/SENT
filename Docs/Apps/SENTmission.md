# **SENTmission – Project Management**

**Division:** SENTerp (Business)  
**Architecture:** Gantt/Kanban Engine (SVAR Gantt)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTmission manages the "Work in Progress" (WIP). It is a project management tool designed for professional services (e.g., MSP deployments, Software Development, Construction). It tracks time, budget, and milestones to ensure projects are profitable.

## **2. Technical Architecture**

### **2.1 The Visualizer**
*   **Engine:** **SVAR Gantt** (React component) for timeline rendering.
*   **Logic:** Critical Path Method (CPM) calculation in Go.

## **3. Core Features**

### **3.1 Planning**
*   **Gantt Charts:** Dependency linking (Task B cannot start until Task A finishes).
*   **Kanban Boards:** Drag-and-drop task movement for Agile workflows.

### **3.2 Resource Loading**
*   **Heatmap:** Visualizes employee workload ("Bob is 120% allocated next week").
*   **Budgeting:** Tracks "Planned vs Actual" hours and dollars.

### **3.3 Costing**
*   **WIP Accounting:** Calculates revenue recognition based on % complete.

## **4. Integration with SENT Ecosystem**
*   **SENTpilot:** Service tickets can be converted into project tasks.
*   **SENTcapital:** Generates milestone invoices automatically.

## **6. Expanded Integration Scenarios**
*   **SENTorbit:** "Sales to Project". Winning a deal in Orbit automatically spawns a project template (e.g., "New Client Onboarding") in Mission.
*   **SENTchat:** "Task Updates". Changes to tasks (Complete, Comment) are posted to the project's chat channel.
*   **SENTpeople:** "Skill Matching". When assigning a task (e.g., "Configure Cisco Router"), suggest employees who have the "CCNA" skill in their HR profile.
*   **SENTdrive:** Project files are stored in a dedicated SENTvault folder, accessible from the Mission UI.

## **7. Future Feature Roadmap**
*   **Portfolio Management:** High-level view of all projects across the company (PMO View).
*   **External Guest Access:** Allow clients to view the Gantt chart and comment on tasks (limited view).
*   **AI Scheduler:** "Optimize Schedule". Automatically rearranges tasks to minimize project duration based on resource availability.
*   **Risk Log:** Track risks and mitigation strategies per project.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Manage tasks and timelines.
*   **In-Scope:**
    *   Project Creation.
    *   Task List (Create/Edit/Delete).
    *   Kanban View.
    *   Basic Gantt (Start/End dates).
    *   Assignee selector.
*   **Out-of-Scope (Phase 2):**
    *   Resource Heatmaps.
    *   Budgeting/Costing.
    *   WIP Accounting.
    *   Dependencies (Critical Path).


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
* **Project Core:** **SVAR Gantt** engine with critical path method (CPM) scheduling.
* **Accounting:** WIP (Work in Progress) tracking and project profitability analytics.
* **Resources:** Heatmap-based capacity planning for engineering teams.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Used to manage all internal SENT development and deployment projects.
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
