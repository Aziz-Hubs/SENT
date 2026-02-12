# **SENTmind – Security Awareness Training**

**Division:** SENTsec (Security)  
**Architecture:** LMS & Phishing Sim (Gophish logic)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTmind targets the "Human Firewall". It is a Learning Management System (LMS) and Phishing Simulation platform designed to educate employees on security best practices. It tracks risk culture and identifies users who need remedial training.

## **2. Technical Architecture**

### **2.1 Phishing Engine**
*   **Sender:** Built-in SMTP engine (similar to **Gophish**) that can spoof internal headers (with permission).
*   **Tracking:** Unique tracking pixels and "click" links for each recipient.

### **2.2 Content Delivery**
*   **Player:** Video player embedded in the SENT desktop app for delivering training modules.

## **3. Core Features**

### **3.1 Simulation Campaigns**
*   **Templates:** Realistic email templates (e.g., "Password Expiry", "Urgent Invoice", "Package Delivery").
*   **Teachable Moments:** If a user clicks a phishing link, they are immediately redirected to a landing page explaining what they missed.

### **3.2 Education**
*   **Curriculum:** Video courses on Password Safety, Social Engineering, Physical Security, etc.
*   **Quizzes:** Interactive tests to verify knowledge retention.

### **3.3 Reporting**
*   **Risk Score:** User-level and Department-level risk scores based on click rates and training completion.

## **4. Integration with SENT Ecosystem**
*   **SENTshield:** Evidence of training compliance is automatically fed into GRC reports.
*   **SENTpeople:** Syncs employee lists to ensure all staff are enrolled in training.

## **6. Expanded Integration Scenarios**
*   **SENTpulse:** "Screensaver". Pushes "Security Tip of the Day" to the Windows Lock Screen/Screensaver via the agent.
*   **SENTradar:** "Real World Testing". If a user *actually* clicks a real malware link (detected by SIEM), SENTmind automatically enrolls them in remedial training.
*   **SENTchat:** "Bot Quiz". A chat bot occasionally asks a security question in the team channel. Correct answers earn points.
*   **SENTpolicy (Shield):** Users must pass a quiz on the "Acceptable Use Policy" before they can access the network (via SENTgrid NAC).

## **7. Future Feature Roadmap**
*   **USB Drop Sim:** Measure if users plug in unknown USB drives (requires SENTguard agent to detect).
*   **Smishing Sim:** Send fake SMS phishing texts (requires Twilio integration).
*   **Deepfake Training:** Examples of AI-generated voice/video to train users to spot fakes.
*   **Gamification Store:** Users earn "Coins" for training that can be redeemed for company swag.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Send a fake email and track clicks.
*   **In-Scope:**
    *   Email Sender (SMTP).
    *   Campaign Manager (Select Users, Select Template).
    *   Landing Page Server (The "You got caught" page).
    *   Basic Reporting (Sent vs. Clicked).
*   **Out-of-Scope (Phase 2):**
    *   LMS / Video Courses.
    *   Quizzes.
    *   Risk Scoring.


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
* **LMS Core:** **Gophish-inspired** phishing simulation and training curriculum manager.
* **Teachable Moments:** Real-time landing pages triggered by simulation failures.
* **Tracking:** Progress analytics and risk culture scoring.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Provides mandatory security awareness training for all SENT staff.
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
