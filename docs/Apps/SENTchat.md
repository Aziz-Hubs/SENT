# **SENTchat – Team Messaging & Collaboration**

**Division:** SENTerp (Business)  
**Architecture:** Real-time Pub/Sub (Centrifugo)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTchat is the central hub for internal communication, designed to replace Slack or Microsoft Teams. It prioritizes asynchronous work with threaded conversations while supporting real-time urgency when needed. It is deeply embedded into every other SENT application, providing a "Chat Sidebar" everywhere.

## **2. Technical Architecture**

### **2.1 The Messaging Engine**
*   **Core:** **Centrifugo** (Go) for handling millions of WebSocket connections.
*   **Storage:** PostgreSQL for message history; Redis for presence and ephemeral state.

## **3. Core Features**

### **3.1 Structure**
*   **Channels:** Public (#general) and Private (Lock icon) rooms.
*   **Threads:** Sidebar discussions to keep main channels clean.
*   **DMs:** Direct Messages for 1:1 or small group privacy.

### **3.2 Rich Media**
*   **Snippets:** Code syntax highlighting.
*   **Voice/Video:** Instant "Huddle" buttons to start a SENTmeet session in the channel.

### **3.3 Workflow Automation**
*   **Bots:** Webhook integration for system alerts (e.g., "New Ticket #123").
*   **Slash Commands:** `/ticket create`, `/zoom`, `/gif`.

## **4. Integration with SENT Ecosystem**
*   **SENTpeople:** Shows Org Chart info on user profiles.
*   **SENTdrive:** Drag-and-drop file sharing links directly to the DMS.

## **6. Expanded Integration Scenarios**
*   **SENTpilot:** "Incident War Room". When a Priority 1 ticket is created, a temporary SENTchat channel is automatically created and relevant staff invited.
*   **SENTcal:** "Availability Status". User avatar shows "In a Meeting" or "On Vacation" automatically based on calendar.
*   **SENTprism:** "Data Unfurling". Pasting a link to a dashboard (e.g., `sent://prism/dashboard/sales`) renders a live mini-chart in the chat.
*   **SENTreflex:** "Approval Bot". Security automation asks "Block this IP?" in chat; Admin clicks "Yes" button in the message to execute.

## **7. Future Feature Roadmap**
*   **Audio Clips:** Walkie-Talkie style voice messages.
*   **Message Translation:** Real-time translation of messages for international teams.
*   **Guest Access:** Invite external clients to specific channels (Single Channel Guests).
*   **Global "Do Not Disturb":** Mutes notifications across all SENT apps (Mail, Pilot, Chat) simultaneously.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Real-time text chat.
*   **In-Scope:**
    *   WebSocket Connection (Centrifugo).
    *   Channel List.
    *   Message Sending/Receiving (Text only).
    *   Presence (Online/Offline).
    *   Notifications (System tray).
*   **Out-of-Scope (Phase 2):**
    *   Threads.
    *   File Uploads.
    *   Voice/Video Calls.
    *   Search History.




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
* **Messaging Core:** **Centrifugo-powered** real-time messaging with channels and threads.
* **Rich Media:** Inline file previews and code snippet syntax highlighting.
* **Persistence:** Partitioned PostgreSQL storage for sub-millisecond message retrieval.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The central hub for all internal SENT team communication and collaboration.
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
*   **Goal:** Real-time message delivery with sub-100ms latency globally.
*   **Goal:** Ensure 100% message persistence integrity during high-concurrency bursts.

### **11.2 Mandatory Testing Suite**
No code will be merged into the SENTcore main branch without 100% passing of the following:
*   **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
*   **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
*   **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
*   **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
*   **Spec:** WebSocket saturation testing with 50,000 concurrent connections via Centrifugo.
*   **Spec:** Verify 'Message Edit/Delete' history in the PostgreSQL audit logs.

### **11.3 Performance & Reliability Benchmarks**
The following KPIs must be validated during the CI/CD pipeline:
*   **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
*   **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
*   **KPI:** Message delivery < 50ms (P95).
*   **KPI:** Search result retrieval < 200ms for 10M messages.

### **11.4 Quality Assurance & Compliance Verification**
*   **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
*   **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
*   **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
