# **SENTsonar – Network Detection & Response (NDR)**

**Division:** SENTsec (Security)  
**Architecture:** Packet Analysis (Suricata Wrapper)  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTsonar provides deep visibility into network traffic. It is a Network Detection and Response (NDR) tool that sits on the wire (via port mirror or tap) and analyzes packet flows for malicious activity that logs might miss, such as Command & Control (C2) beacons or lateral movement.

## **2. Technical Architecture**

### **2.1 The Sensor**
*   **Engine:** **Suricata** (IDS/IPS engine) managed by a Go wrapper.
*   **Interface:** Promiscuous mode capture on designated network interfaces.

### **2.2 Analysis**
*   **Flow Logs:** Generates NetFlow/IPFIX equivalent data for bandwidth analysis.
*   **Signature Matching:** Uses Emerging Threats (ET) and custom Snort-syntax rules.

## **3. Core Features**

### **3.1 Intrusion Detection**
*   **Malware Communication:** Detects connections to known botnet controllers.
*   **Exploit Attempts:** Identifies signatures of attacks like EternalBlue or Log4Shell on the wire.

### **3.2 Traffic Analysis**
*   **Protocol Decoding:** Understands HTTP, DNS, TLS, SMB, etc.
*   **JA3 Fingerprinting:** Identifies malicious SSL/TLS clients based on their handshake fingerprint, even if traffic is encrypted.

### **3.3 File Extraction**
*   **Artifacts:** Can extract files (EXEs, PDFs) from the stream for analysis (sent to Sandbox).

## **4. Integration with SENT Ecosystem**
*   **SENTradar:** Sends alerts and flow logs to the SIEM.
*   **SENTreflex:** Can trigger firewall blocks via SENTgrid based on Sonar alerts.

## **6. Expanded Integration Scenarios**
*   **SENToptic:** "Bandwidth Hog". Identify which camera is saturating the network by correlating flow data with the camera IP.
*   **SENTguard:** "Confirmation". If Sonar sees C2 traffic, it asks SENTguard to check which process on the endpoint initiated that connection.
*   **SENTnexus:** "Unknown Device". If Sonar sees traffic from a MAC address not in the SENTnexus asset list, it creates a "Rogue Device" alert.
*   **SENTwave:** "VoIP Quality". Analyzes RTP streams to detect Jitter/Packet Loss without needing the phone's logs.

## **7. Future Feature Roadmap**
*   **Encrypted Traffic Analysis (ETA):** Machine Learning to detect malicious traffic inside SSL without decryption (based on packet timing/size).
*   **Decryption Broker:** Man-in-the-Middle capability to decrypt traffic (with installed root CA) for deep inspection.
*   **PCAP Replay:** Ability to upload a .pcap file and run it against the rules engine.
*   **Geo-Map:** 3D Globe visualization of where traffic is going.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Sniff traffic and log alerts.
*   **In-Scope:**
    *   Suricata Embedded.
    *   Interface Selector.
    *   ET Open Ruleset (Download & Update).
    *   Alert Log Viewer.
    *   Basic Stats (Packets/Sec).
*   **Out-of-Scope (Phase 2):**
    *   Flow Logging (NetFlow).
    *   File Extraction.
    *   JA3 Fingerprinting.


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
* **NDR Engine:** **Suricata-based** packet inspection for network-level threat detection.
* **Analysis:** JA3 fingerprinting and protocol decoding (HTTP, DNS, TLS).
* **Integration:** Sends real-time network alerts to SENTradar for correlation.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Provides deep network visibility for SENT's internal security operations.
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
