# **SENTwave – Cloud VoIP & Telephony**

**Division:** SENTmsp (Infrastructure)  
**Architecture:** Real-time Communication (Pion WebRTC + SIP)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**
SENTwave is a modern, cloud-native Voice over IP (VoIP) phone system embedded directly into the SENT desktop experience. It replaces physical desk phones and legacy PBX systems with a softphone capable of handling calls, SMS, and complex routing logic. It leverages the "Native Bridge" pattern to ensure high-quality audio processing free from browser tab throttling.

## **2. Technical Architecture**

### **2.1 The Voice Engine**
*   **Library:** **Pion WebRTC** (Pure Go implementation) for media transport.
*   **Protocol:** SIP (Session Initiation Protocol) over WebSocket for signaling.
*   **Codecs:** Opus (high fidelity) and G.711 (legacy compatibility).

### **2.2 Infrastructure**
*   **Gateways:** Connects to upstream SIP Trunking providers (e.g., Twilio, Telnyx) for PSTN connectivity.

## **3. Core Features**

### **3.1 Unified Softphone**
*   **Dialer:** Integrated keypad and contact list within the SENT app.
*   **Call Handling:** Hold, Transfer (Blind & Attended), Mute, and Conference.
*   **Media Engine:** Leveraged **Pion WebRTC (v4)** for native Go-based audio processing, ensuring high-fidelity communication with low overhead.
*   **Adaptive Jitter Buffer:** Implemented a dynamic backend buffer that adjusts to network conditions to maintain MOS scores > 4.0.

### **3.2 Advanced Routing (PBX)**
*   **IVR Editor:** Visual "Drag-and-Drop" editor (React Flow) for building call menus.
*   **IVR Engine:** Backend state machine that interprets version-controlled JSON DAGs from SENTnexus to route calls dynamically.
*   **Ring Groups:** Strategies for team ringing (Simultaneous, Round Robin, Least Recently Called).

### **3.3 Omni-Channel & Storage**
*   **Recording:** Automated capture of RTP streams directly to **SENTvault** using Afero filesystem abstraction.
*   **Visual Voicemail:** Transcribed voicemail messages sent directly to the user's inbox (SENTmail) and chat (SENTchat).

## **4. Integration with SENT Ecosystem**
*   **SENTorbit:** "Screen Pop" – automatically opens CRM records upon ringing.
*   **SENTchat:** Auto-syncs user presence status to "In a Call".
*   **SENTpilot:** Attaches call logs and recording links to active support tickets.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Make and Receive a 1:1 call to the PSTN.
*   **In-Scope:**
    *   SIP Registration (Twilio/Telnyx).
    *   **WebRTC Media Stack** (Pion).
    *   **Adaptive Jitter Buffer**.
    *   **Visual IVR Orchestrator**.
    *   **Integrated Recording Pipeline**.
    *   Dialpad UI & Call History.
*   **Out-of-Scope (Phase 2):**
    *   SMS/MMS.
    *   Voicemail Transcription AI.
    *   Teams Sip-forking.


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
* **VoIP Core:** **Pion WebRTC-based** softphone with **SIP-over-WebSocket** signaling.
* **Media Engine:** Leverages **Pion v4** for low-level **ICE negotiation** and STUN/TURN orchestration to ensure NAT traversal success across 99% of network environments.
* **Audio Engine:** **Adaptive Jitter Buffer** implemented in Go to maintain MOS > 4.0.
* **Job Orchestration:** Utilizes **River** for the **Call Redirection** worker and voicemail transcription tasks.
* **PBX Logic:** Visual **IVR DAG orchestrator** that processes complex call-routing trees stored as JSON-serialized state machines in the database.
* **Storage:** Automated **RTP stream capture** to SENTvault with Afero abstraction, preserving exact media timing for forensic replay.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** The primary telephony system used by SENT's internal support and sales teams.
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
* **Spec:** Verify **WebRTC ICE negotiation** latency and STUN/TURN traversal success.
* **Spec:** Validate **IVR DAG orchestrator** for cycle detection and invalid transition handling.
* **Spec:** Test **Adaptive Jitter Buffer** against simulated network jitter/packet loss.

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
