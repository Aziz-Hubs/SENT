# **SENTguard – Endpoint Detection & Response (EDR)**

**Division:** SENTsec (Security)  
**Architecture:** Endpoint Agent Extension (Go + Gopacket)  
**Status:** [DESIGN]

## **1. Executive Summary**

SENTguard is the shield on the device. It acts as an Endpoint Detection and Response (EDR) / Next-Gen Antivirus (NGAV) system. While **SENTpulse** provides technician-led active management (Service control, process killing), **SENTguard** is the **automated defense** layer—hooking into the OS kernel to autonomously block malicious processes, ransomware encryption attempts, and unauthorized network connections in real-time.

## **2. Technical Architecture**

### **2.1 The Defender**

- **Kernel Integration:** Utilizes kernel drivers (Sysmon / eBPF on Linux) for deep visibility.
- **Engine:** **Gopacket** for local packet inspection and process tree analysis.

## **3. Core Features**

### **3.1 Active Protection**

- **Process Blocking:** Prevents execution of unsigned or blacklisted binaries.
- **Ransomware Canary:** Monitors "Honeypot" files. If a process tries to modify them, the process is instantly killed and the device isolated.
- **USB Control:** Blocks or Read-Only mounts unauthorized USB storage devices.

### **3.2 Investigation**

- **Flight Recorder:** continuous recording of process executions, file mods, and network conns (stored locally, metadata sent to Cloud).
- **Live Shell:** Secure remote shell for analysts to perform forensic cleanup.

### **3.3 Isolation**

- **Network Quarantine:** Can cut off all network access except to the SENT management server, preventing lateral movement.

## **4. Integration with SENT Ecosystem**

- **SENTpulse:** Deploys and manages the SENTguard module.
- **SENTradar:** Streams EDR telemetry to the SIEM.
- **SENTsignal:** Consumes hash blocklists to stop known malware.

## **6. Expanded Integration Scenarios**

- **SENTnexus:** "Application Inventory". Builds a list of every installed app and its usage frequency for the documentation.
- **SENTreflex:** "Automatic Isolation". If SENTguard detects high-confidence ransomware, it tells Reflex, which then tells the Firewall (SENTgrid) to block the device at the switch port level too (double-tap).
- **SENTpilot:** "User Prompt". When blocking a file, pop up a dialog asking the user "Do you need this for work?" - creates a ticket for whitelisting if they say Yes.
- **SENTmind:** "Education". If a user tries to run a known PIRATED game/app, show a SENTmind warning about software piracy risks.

## **7. Future Feature Roadmap**

- **Rollback:** Shadow Copy integration to restore files encrypted by ransomware automatically.
- **Memory Scanning:** Scan RAM for code injection (DLL sideloading, Cobalt Strike beacons).
- **Linux eBPF:** High-performance, safe kernel tracing for Linux servers.
- **MacOS System Extension:** Native Endpoint Security Framework support for Mac.

## **8. Minimum Viable Product (MVP) Scope**

- **Core Goal:** Process visibility and simple hash blocking.
- **In-Scope:**
  - Process Monitor (Log every process start/stop).
  - Hash Blocker (Prevent execution of SHA256 list).
  - Isolation Mode (Disconnect NIC).
  - File Integrity Monitor (Watch critical folders).
- **Out-of-Scope (Phase 2):**
  - Ransomware Heuristics.
  - Kernel Drivers.
  - USB Control.
  - Flight Recorder (Data Recorder).

## **10. Technical Design Document (TDD)**

### **10.1 Architectural Infrastructure**

This module is a high-performance component of the **SENT Unified Monolith**, leveraging a single-binary distribution strategy for cross-platform deployment (Windows, macOS, Linux).

- **Core Engine:** Compiled **Go 1.24+** backend utilizing a modular service architecture.
- **UI Layer:** **React 19** frontend served via **Wails v2**, ensuring native performance with web-standard styling (Tailwind CSS).
- **State Management:** Lightweight, high-performance state handling using **Zustand** and **Immer**.
- **Communication:** Internal function-call routing for inter-app telemetry and **Centrifugo** for real-time WebSocket events.

### **10.2 Data Persistence & Schema**

- **Relational Model:** **PostgreSQL** with **Ent ORM** for strictly-typed, graph-aware relationship management.
- **Time-Series Core:** Integrated **TimescaleDB** hypertables for performance-critical metrics and high-volume audit logs.
- **Caching Strategy:** Multi-level caching using in-memory Go maps and **Redis** for distributed state across the monolith's worker nodes.

### **10.3 Module-Specific Engineering**

- **EDR Core:** **Gopacket-based** packet capture and OS-level process monitoring.
- **Active Defense:** Automated network isolation and malicious process termination.
- **Forensics:** Continuous file integrity monitoring and ransomware canary triggers.

### **10.4 Ecosystem Integration & Operational Context**

As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:

- **Operational Role:** The primary defense layer on every SENT internal workstation.
- **Inter-App Synergy:** Real-time data sharing with other SENT modules (e.g., **SENTvault** for file persistence, **SENTchat** for alerts) via the centralized internal message bus.

### **10.5 Security, Compliance & Audit**

- **Identity:** Unified authentication via **Zitadel** (OIDC), enforcing granular Role-Based Access Control (RBAC).
- **Protection:** Mandatory **AES-256-GCM** encryption for all sensitive fields at rest and **TLS 1.3** for all internal and external communication.
- **Auditability:** Every transaction is recorded in an immutable audit hypertable, including the actor, delta, and cryptographic hash for non-repudiation.

### **10.6 Performance & Lifecycle Management**

- **Scalability:** Stateless horizontal scaling of worker processes, managed by the core SENT scheduler.
- **Observability:** Full-stack tracing via **OpenTelemetry** and real-time health monitoring via **Prometheus** endpoints.
- **CI/CD:** Automated testing suites (Unit, Integration, E2E) required for every build, ensuring 99.99% system uptime.

## **11. Engineering Requirements & Quality Assurance**

### **11.1 Key Engineering Goals**

Developers must prioritize the following objectives to ensure the module meets SENT's enterprise standards:

- **Goal:** Detect and block 100% of known ransomware encryption patterns in real-time.
- **Goal:** Ensure zero system crashes due to kernel-level monitoring hooks.

### **11.2 Mandatory Testing Suite**

No code will be merged into the SENTcore main branch without 100% passing of the following:

- **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
- **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
- **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
- **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
- **Spec:** Execute 'Detonate' tests in a sandbox to verify automated process termination and network isolation.
- **Spec:** Perform 'Compatibility Tests' with common anti-virus software to avoid driver conflicts.

### **11.3 Performance & Reliability Benchmarks**

The following KPIs must be validated during the CI/CD pipeline:

- **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
- **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
- **KPI:** Detection-to-Block time < 50ms.
- **KPI:** < 5% system overhead during full-disk scanning.

### **11.4 Quality Assurance & Compliance Verification**

- **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
- **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
- **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
