# **SENTprobe – Vulnerability Scanner**

**Division:** SENTsec (Security)  
**Architecture:** Scanner Wrapper (Nuclei Engine)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTprobe is the offensive security arm of the platform. It performs continuous vulnerability scanning to identify weaknesses before attackers do. Built on top of the powerful open-source **Nuclei** engine, it allows for template-based scanning of web applications, networks, and cloud infrastructure.

## **2. Technical Architecture**

### **2.1 The Scanning Core**
*   **Engine:** Embedded **Nuclei** (Go-based scanner).
*   **Templates:** Utilizes the community Nuclei-Templates repository + proprietary SENT signatures.

### **2.2 Scheduler**
*   **Routine:** Configurable scanning windows (e.g., "Scan External IPs every Sunday at 2 AM").

## **3. Core Features**

### **3.1 External Attack Surface Management (EASM)**
*   **Asset Discovery:** Subdomain enumeration and port scanning to find "Shadow IT".
*   **Vulnerability Checks:** Scans for CVEs, misconfigurations, default credentials, and exposed panels.

### **3.2 Internal Scanning**
*   **Agent-Based:** SENTpulse agents can act as "Scan Nodes" to scan the internal network from the inside, reaching non-public subnets.
*   **Authenticated Scans:** Supports credentialed scanning for deeper analysis.

### **3.3 Reporting**
*   **Prioritization:** Ranks vulnerabilities by CVSS score and "Exploitability" (is there a public exploit available?).
*   **Remediation Tips:** Provides clear instructions on how to fix findings.

## **4. Integration with SENT Ecosystem**
*   **SENTpilot (Sec):** Auto-creates tickets for High/Critical vulnerabilities.
*   **SENThorizon:** Feeds into the "Security Risk Score" for the vCIO reports.

## **6. Expanded Integration Scenarios**
*   **SENTcanvas (CMS):** "Pre-Flight Check". Automatically scans the corporate website staging environment before a new deployment is pushed live.
*   **SENTgrid:** "Router Audit". Scans network devices for open management ports (Telnet/HTTP) that should be closed.
*   **SENTcode (Conceptual):** Scans git repositories for accidental secrets/keys committed to code.
*   **SENTreflex:** "Auto-Patch". If SENTprobe finds a vulnerability that has a known patch, it triggers SENTreflex/SENTpulse to install the update.

## **7. Future Feature Roadmap**
*   **Fuzzing:** Active fuzzing of input fields to find SQL Injection/XSS (Advanced mode).
*   **Screenshotting:** Visual inspection of all open web ports.
*   **Technology Stack Fingerprinting:** Identify "Wordpress v5.8", "Nginx 1.14" to build a software inventory.
*   **Continuous Monitoring:** "Real-time" scanning. If a new subdomain appears, scan it immediately.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Run a Nuclei scan against a target URL.
*   **In-Scope:**
    *   Nuclei Binary Integration.
    *   Target Input Field.
    *   Default Template Set (Top 100 vulnerabilities).
    *   Result Parsing (JSON to Table).
    *   Export to CSV.
*   **Out-of-Scope (Phase 2):**
    *   Scheduler.
    *   Internal Agent-based scanning.
    *   Ticket integration.


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
* **Scanner Core:** Embedded **Nuclei** engine for template-based vulnerability identification.
* **Discovery:** Automated port scanning and service fingerprinting for Shadow IT detection.
* **Remediation:** Direct integration with SENTpilot for automated patch ticket creation.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Performs continuous vulnerability assessment of SENT's internal and external infrastructure.
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
