# **SENTcanvas – Headless CMS & Website Builder**

**Division:** SENTerp (Business)  
**Architecture:** CMS Engine  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTcanvas empowers the Marketing team. It is a Headless Content Management System (CMS) used to build and manage the corporate website (e.g., sent.jo). It separates the content (text/images) from the code.

## **2. Technical Architecture**

### **2.1 Content Repository**
*   **Structure:** Flexible content types (Blog Post, Case Study, Team Member).
*   **Delivery:** High-performance JSON API.

## **3. Core Features**

### **3.1 Visual Editor**
*   **Page Builder:** "What You See Is What You Get" (WYSIWYG) editor for non-technical marketers.
*   **SEO:** Built-in tools for meta tags, sitemaps, and redirects.

### **3.2 Assets**
*   **Media Library:** Integrated with SENTvault for image optimization and serving.

## **4. Integration with SENT Ecosystem**
*   **SENTorbit:** "Contact Us" forms on the website inject leads directly into the CRM.

## **6. Expanded Integration Scenarios**
*   **SENTpeople:** "Team Page". The "About Us" page automatically pulls team member bios and photos from HR (if marked public).
*   **SENTaccess:** "Login Link". Provides the authentication wrapper for the Client Portal.
*   **SENTchat:** "Live Chat". Embeds a SENTchat widget on the public site for visitors to talk to sales.
*   **SENThorizon:** "Public Status". Publish a "System Status" page (e.g., "All Systems Operational") powered by monitoring data.

## **7. Future Feature Roadmap**
*   **A/B Testing:** Serve two versions of a headline and see which converts better.
*   **Personalization:** Show different content if the visitor is an existing client vs. a prospect.
*   **Multi-Language:** Translation management workflow.
*   **Static Site Generator (SSG):** Compile the whole site to HTML for S3 hosting (faster/cheaper).

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Manage blog posts and basic pages.
*   **In-Scope:**
    *   Content Type Builder.
    *   Rich Text Editor.
    *   API Endpoint (Get /posts).
    *   Image Upload.
*   **Out-of-Scope (Phase 2):**
    *   Visual Page Builder.
    *   Preview Mode.
    *   SEO Tools.
    *   A/B Testing.




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
* **CMS Core:** Headless CMS engine for managing structured web content.
* **Delivery:** JSON-first API delivery optimized for SENT's Next.js frontends.
* **Visuals:** Integrated media library with automated image optimization.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Powers the SENT LLC corporate website and public documentation sites.
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
