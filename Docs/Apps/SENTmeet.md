# **SENTmeet – Video Conferencing**

**Division:** SENTerp (Business)  
**Architecture:** SFU / WebRTC (Pion)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTmeet is a secure, high-definition video conferencing platform. It eliminates the need for Zoom or Google Meet by providing a native meeting experience. It leverages the "Worker Mode" of the SENT binary to act as a Selective Forwarding Unit (SFU), routing video packets efficiently.

## **2. Technical Architecture**

### **2.1 The Media Server**
*   **Engine:** **Pion WebRTC** (Go).
*   **Topology:** SFU (Selective Forwarding Unit) – clients send 1 stream up, receive N streams down (optimized bandwidth).

## **3. Core Features**

### **3.1 Meeting Experience**
*   **HD Video:** Adaptive bitrate streaming (720p/1080p).
*   **Screen Sharing:** Share entire desktop or specific window (native OS capture).
*   **Recording:** Server-side or Client-side recording to MP4.

### **3.2 Collaboration**
*   **Whiteboard:** Collaborative drawing canvas.
*   **Breakout Rooms:** Split large meetings into smaller groups.

### **3.3 Privacy**
*   **E2EE:** End-to-End Encryption option for sensitive meetings.
*   **Lobby:** Waiting room controls.

## **4. Integration with SENT Ecosystem**
*   **SENTcal:** Meetings are automatically linked to calendar events.
*   **SENTchat:** "Join" button appears in chat channels when a meeting starts.

## **6. Expanded Integration Scenarios**
*   **SENTscribe:** "Meeting Minutes". The meeting audio is transcribed in real-time and saved as a SENTscribe document automatically.
*   **SENTorbit:** "Sales Call Analysis". Recordings are linked to the CRM deal; AI analyzes "Talk Time" ratio between Sales Rep and Client.
*   **SENTdeck:** "Live Presenter". Push slides from SENTdeck directly into the video stream (not just screen sharing) for higher quality text rendering.
*   **SENTpeople:** "Interview Mode". When interviewing a candidate, the HR scorecard appears in a side panel for the interviewer.

## **7. Future Feature Roadmap**
*   **Virtual Backgrounds:** Blur or replace background without a green screen.
*   **Noise Cancellation:** AI-based suppression of dog barking/keyboard typing.
*   **Remote Desktop Control:** Allow one participant to control another's mouse (for IT support).
*   **Live Polling:** Pop-up quizzes/polls during the meeting.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Multi-party video call.
*   **In-Scope:**
    *   Pion SFU Backend.
    *   Join via Link.
    *   Camera/Mic toggles.
    *   Grid View (Up to 4 people).
    *   Screen Sharing.
*   **Out-of-Scope (Phase 2):**
    *   Recording.
    *   Chat inside meeting.
    *   Virtual Backgrounds.
    *   Dial-in (Phone) support.


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
* **Media Engine:** **Pion WebRTC** SFU topology for high-definition video and audio.
* **Collaboration:** Collaborative whiteboard and native screen sharing with remote control.
* **Recording:** Server-side MP4 capture with automated transcription via SENTscribe.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Powering all internal and client-facing video conferencing for SENT.
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
*   **Goal:** Maintain sub-200ms glass-to-glass latency for HD video streams.
*   **Goal:** Ensure 99.9% uptime for the SFU media routing layer.

### **11.2 Mandatory Testing Suite**
No code will be merged into the SENTcore main branch without 100% passing of the following:
*   **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
*   **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
*   **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
*   **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
*   **Spec:** Simulate 50% packet loss and 100ms jitter to verify Pion WebRTC adaptive bitrate (ABR) logic.
*   **Spec:** Load-test the recording engine to ensure zero frame-drops during server-side capture.

### **11.3 Performance & Reliability Benchmarks**
The following KPIs must be validated during the CI/CD pipeline:
*   **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
*   **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
*   **KPI:** Average latency < 150ms on fiber connections.
*   **KPI:** Jitter buffer delay < 20ms.

### **11.4 Quality Assurance & Compliance Verification**
*   **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
*   **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
*   **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
