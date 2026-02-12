# **SENTdeck – Presentations**

**Division:** SENTerp (Business)  
**Architecture:** Canvas / Slide Engine  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTdeck is the storytelling tool. It allows users to create professional slide decks for sales pitches, internal reviews, and client reports. It focuses on "Smart Slides" that update automatically when underlying data changes.

## **2. Technical Architecture**

### **2.1 The Canvas**
*   **Rendering:** SVG-based canvas for scalable graphics.
*   **Templates:** Corporate branding lock (fonts, colors, logos) enforced globally.

## **3. Core Features**

### **3.1 Smart Slides**
*   **Live Data:** Link a chart in a slide to a SENTsheet cell or a SENTprism dashboard. When the data updates, the slide updates.
*   **Code Mode:** Markdown-to-Slide conversion for developers.

### **3.2 Presenter Mode**
*   **Remote Control:** Control the presentation from the SENT mobile app.
*   **Notes:** Private speaker notes.

## **4. Integration with SENT Ecosystem**
*   **SENThorizon:** QBR reports are generated as Deck files.
*   **SENTorbit:** Sales pitch decks are tracked (who opened it, how long they read) when sent to leads.

## **6. Expanded Integration Scenarios**
*   **SENTmeet:** "Native Broadcast". The deck engine renders directly into the video stream for pixel-perfect quality.
*   **SENTcanvas:** "Web Embed". Embed a deck into the corporate website (e.g., for an investor relations page).
*   **SENTpilot:** "Incident Review". Auto-generate a slide deck post-incident with timeline, root cause, and remediation steps.
*   **SENTvault:** Decks are stored with version control, allowing "Revert to yesterday's version".

## **7. Future Feature Roadmap**
*   **AI Design:** "Make this look better". Auto-arranges text and images into a professional layout.
*   **Live Q&A:** Spectators can type questions that appear on the presenter's private screen.
*   **Video Export:** Convert the presentation (with voiceover) into an MP4 video.
*   **Brand Enforcer:** Prevent users from using Comic Sans or non-brand colors.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Create a slide deck and present it.
*   **In-Scope:**
    *   Slide Editor (Text, Image, Shapes).
    *   Basic Transitions (Fade, Slide).
    *   Fullscreen Presenter Mode.
    *   PDF Export.
    *   Local Save.
*   **Out-of-Scope (Phase 2):**
    *   Live Data Links.
    *   Remote Control.
    *   Collaboration.
    *   Markdown Mode.




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
* **Presentation Engine:** SVG-based slide rendering with live data binding to SENTprism.
* **Presenter Mode:** Dual-screen presenter view with private speaker notes.
* **Code Mode:** Markdown-to-slide conversion for developer presentations.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Used by Marketing and Growth to create internal and external sales decks.
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
