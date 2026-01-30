# **SENTmail – Universal Email Client**

**Division:** SENTerp (Business)  
**Architecture:** IMAP/SMTP Client (Go-IMAP)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTmail is a lightning-fast, native email client built to replace Outlook and Webmail. It aggregates accounts from Exchange, Gmail, iCloud, and IMAP providers into a unified "Zero Inbox" experience. It runs locally, ensuring that email search is instant and offline access is robust.

## **2. Technical Architecture**

### **2.1 The Mail Engine**
*   **Libraries:** **go-imap** (Fetching) and **go-smtp** (Sending).
*   **Database:** Local SQLite/BadgerDB cache of headers and bodies for instant full-text search without server round-trips.

## **3. Core Features**

### **3.1 Unified Inbox**
*   **Aggregation:** View emails from multiple accounts in a single stream.
*   **Focus Mode:** AI-based filtering to separate "Important" mail from newsletters and notifications.

### **3.2 Productivity Tools**
*   **Snooze:** "Remind me later" functionality.
*   **Send Later:** Schedule emails to be sent at a specific time (held in local outbox or server-side if supported).
*   **Templates:** Canned responses for common inquiries.

### **3.3 Deep Integration**
*   **Ticket Conversion:** One-click "Convert to Ticket" (sends to SENTpilot).
*   **CRM Link:** Hovering over a sender shows their CRM profile from SENTorbit.

## **4. Integration with SENT Ecosystem**
*   **SENTcal:** Auto-detects meeting invites and adds them to the calendar.
*   **SENTvault:** Save attachments directly to secure document storage.

## **6. Expanded Integration Scenarios**
*   **SENTmission:** "Email to Task". Drag an email into a SENTmission project board to create a task, keeping the email thread attached for context.
*   **SENTchat:** "Discuss this Email". Share an email content to a chat channel for discussion without forwarding it.
*   **SENTshield:** "Phish Report". A big "Report Phishing" button analyzes the headers using SENTsignal and submits it to the security team.
*   **SENTcapital:** "Receipt Scan". Forward invoice emails to `receipts@sent` (or drag to SENTcapital tab) to auto-extract amount and date.

## **7. Future Feature Roadmap**
*   **AI Summary:** "TL;DR" button. Uses a local LLM to summarize long email threads into 3 bullet points.
*   **Read Receipts:** Pixel tracking to see when a recipient opens your email (if enabled/allowed).
*   **Undo Send:** 10-second buffer to recall an email after hitting send.
*   **Voice Dictation:** Native speech-to-text for composing emails.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Send and Receive email via IMAP/SMTP.
*   **In-Scope:**
    *   IMAP Sync (Download Headers/Body).
    *   SMTP Send (Plain text).
    *   Local Cache (SQLite).
    *   Basic UI (List view, Reader view).
    *   Attachments (Download/Upload).
*   **Out-of-Scope (Phase 2):**
    *   Unified Inbox (Single account only for MVP).
    *   Snooze / Send Later.
    *   HTML Composer.
    *   Search.


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
* **Mail Core:** High-performance **Go-IMAP** client with localized header caching.
* **Productivity:** Unified inbox with AI-assisted focus mode and deep search.
* **Security:** Integrated phishing reporting and header analysis via SENTsignal.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The primary email client used by all SENT employees for secure communication.
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
