# **SENT LLC \- Master Technical Architecture**

**Version:** 4.1 (Detailed Implementation Specification)

**Architecture Style:** Unified Modular Monolith (Native Desktop & Hybrid Cloud)

**Repository Strategy:** Monorepo (Go Workspaces \+ Turborepo)

**Target Launch:** Q3 2026

## **1\. Architectural Vision: "The Native Singularity"**

The SENT ecosystem utilizes a **Unified Modular Monolith** architecture. Unlike traditional web applications that rely on browser tabs and HTTP calls, SENT is delivered as a **Native Desktop Application** using **Wails v2**.

This approach allows us to maintain a single codebase (Go backend \+ React frontend) while deploying high-performance binaries that interact directly with the Operating System, bypassing the latency and security risks of the public web.

### **1.1 The "Native Bridge" Pattern**

Standard web apps run logic in the browser and fetch data via HTTP (JSON over REST/GraphQL). SENT changes this paradigm:

1. **The Container:** The Frontend runs inside the OS's native WebView (WebView2 on Windows, WebKit on macOS/Linux).  
2. **The Bridge:** There is no local web server opening ports (no localhost:3000). JavaScript calls Go methods directly via a **Zero-Latency IPC (Inter-Process Communication) Bridge**.  
3. **The Benefit:**  
   * **Memory-Mapped Calls:** API calls bypass the TCP/IP stack entirely, resulting in sub-millisecond bridge latency.  
   * **Hardware Access:** The app can natively access file systems, serial ports (for printers), and raw sockets (for network scanning) without browser sandboxing limits.

## **2\. Core Technology Stack (Universal Layers)**

| Layer               | Technology            | Implementation Detail                                                                              |
| :------------------ | :-------------------- | :------------------------------------------------------------------------------------------------- |
| **Desktop Runtime** | **Wails v2**          | Handles window management, native menus, and the JS-to-Go binding. Generates .exe, .app, and .deb. |
| **Core Backend**    | **Go (Golang) 1.24+** | Handles business logic, database connections, and background routines.                             |
| **Frontend UI**     | **React 19 \+ Vite**  | Compiled into static assets and embedded directly into the Go binary.                              |
| **Components**      | **ShadCN/UI**         | Re-usable component system based on Radix UI and Tailwind. Code is copied, not imported.           |
| **Styling**         | **TailwindCSS**       | Utility-first styling for rapid UI development.                                                    |
| **Database**        | **PostgreSQL 16**     | Primary relational store. Hosted externally (Cloud/On-Prem) or locally via Docker.                 |
| **Time-Series**     | **TimescaleDB**       | Extension enabled on Postgres for high-ingest telemetry (logs, metrics).                           |
| **Data Access**     | **PGX & SQLc**        | Fast, type-safe SQL code generation defined by standard SQL queries.                               |
| **Migrations**      | **Atlas**             | Declarative schema migration management for Postgres.                                              |
| **Auth**            | **Zitadel**           | OIDC Provider. Handles SSO, MFA, and Audit Trails.                                                 |

## **3\. Workload Isolation Strategy (The "Noisy Neighbor" Fix)**

To prevent resource-heavy features (Video Conferencing, Log Analysis) from slowing down critical business operations (ERP Ledger), we employ a **Runtime Mode** strategy. The same binary is used, but initialized differently based on flags.

### **3.1 Mode A: Desktop Client (User Facing)**

* **Command:** ./sent-app  
* **Role:** Renders the UI, handles user input, lightweight local tasks.  
* **Resource Priority:** High UI responsiveness.

### **3.2 Mode B: Isolated Worker (Server Side)**

* **Command:** ./sent-app \--mode=worker \--service=meet  
* **Role:** Runs headless (no UI). Dedicated to processing specific high-load queues.  
* **Examples:**  
  * \--service=meet: Spawns the **Pion WebRTC** SFU to route video packets.  
  * \--service=radar: Spawns the **Expr** log evaluator to process 10k+ events/sec.  
  * \--service=optic: Spawns the **MediaMTX** RTSP server for CCTV streams.
  * \--service=grid: Spawns the **SSH Worker Pool** for network orchestration.
  * \--service=wave: Spawns the **SIP/WebRTC Gateway** for telephony.

## **4\. Specialized Engine Integration ("Power-Ups")**

We wrap specialized open-source engines into our Go monolithic structure to provide enterprise capabilities without reinventing the wheel.

### **A. Communication Engine (SENTcomm)**

* **SENTchat (Engine: Centrifugo):**  
  * *Implementation:* Embedded Go library. Handles Pub/Sub for chat messages.  
  * *Bridge:* React listens to Centrifugo events via WebSocket for real-time updates.  
* **SENTmeet (Engine: Pion WebRTC):**  
  * *Implementation:* Pure Go WebRTC implementation.  
  * *Isolation:* Runs as a dedicated worker service.  
  * *Function:* SFU (Selective Forwarding Unit) logic to mix video streams.  
* **SENTwave (Engine: Pion + SIP):**
  * *Implementation:* SIP-over-WebSocket signaling with Pion WebRTC v4 for media transport.
  * *Isolation:* Spawns as a dedicated telephony worker.
  * *Intelligence:* Adaptive jitter buffer and visual IVR DAG orchestrator.
* **SENTmail (Engine: Go-IMAP / Go-SMTP):**  
  * *Implementation:* Backend Go routines that sync email headers to Postgres. Frontend renders cached data for instant search.

### **B. Business Logic Engine (SENTerp)**

* **SENTsheet (Engine: Univer):**  
  * *Implementation:* The Univer Canvas SDK is loaded in the React Frontend.  
  * *Persistence:* Data is saved as JSON blobs in Postgres via the Wails Bridge (SaveSheet(json)).  
* **SENTcapital (Engine: Shopspring/Decimal):**  
  * *Implementation:* All financial math happens in Go using fixed-point arithmetic to avoid floating-point errors.  
* **SENTpeople (Engine: Maroto v2 + Decimal):**
  * *Implementation:* Programmatic PDF contract generation with digital signature overlay.
  * *Precision:* Multi-currency Gross-to-Net payroll engine utilizing shopspring/decimal.
* **SENTstock (Engine: React-Zxing):**  
  * *Implementation:* Accesses the device webcam via the browser context (WebView) to decode barcodes, sending strings to Go via the bridge.

### **C. Security & Infrastructure Engine (SENTsec/MSP)**

* **SENTradar (Engine: Expr \+ Sigma):**  
  * *Implementation:* Go-based expression evaluation. Compiles Sigma rules into Go functions for rapid log matching.  
* **SENTshield (Engine: Maroto):**  
  * *Implementation:* Programmatic PDF generation. React sends data structs to Go; Go utilizes Maroto to draw the PDF and returns the byte slice to the UI.  
* **SENTguard (Engine: Gopacket):**  
  * *Implementation:* Uses libpcap bindings to capture traffic on the network interface for analysis.
* **SENTcontrol (Engine: MS Graph + SNI):**
  * *Implementation:* Native Cloud SDKs for identity sync; BPF-backed SNI filtering for SaaS egress control.
* **SENTnexus (Engine: SQLc + AES-GCM):**
  * *Implementation:* Recursive graph traversal engine for blast radius analysis; hardware-accelerated vault.
* **SENToptic (Engine: MediaMTX \+ TFLite):**
  * *Implementation:* MediaMTX for stream ingestion; TFLite for local INT8 object detection on keyframes.
* **SENTgrid (Engine: TextFSM):**
  * *Implementation:* Embedded TextFSM templates used to normalize unstructured CLI output into JSON.
* **SENTpulse (Engine: TimescaleDB):**
  * *Implementation:* Utilizes Postgres Hypertables and Continuous Aggregates for high-speed telemetry querying.

## **5\. Data Architecture (PostgreSQL \+ SQLc)**

### **5.1 The Unified Schema**

All applications share a single database schema managed by raw SQL migrations.

* **Tenancy:** Every table includes organization_id for strict isolation, enforced reliably at the query level.
* **Global Interceptor:** A centralized **MW Wrapper** (`pkg/database/postgres.go`) intercepts all mutations across all nine apps to generate immutable entries in the `AuditLog` hypertable automatically.
* **Hypertables:** Tables for device\_metrics and security\_logs are converted to TimescaleDB hypertables for automatic partitioning.
* **Encryption:** Sensitive fields (Passwords, PII, Payroll) utilize **AES-256-GCM** authenticated encryption with hardware-accelerated CPU instructions.

### **5.2 Storage Strategy**

* **Structured Data:** Stored in PostgreSQL columns.  
* **Unstructured Data (Documents/Images):**  
  * **Engine:** Afero (Filesystem Abstraction).  
  * **Deployment:** Configurable to store on Local Disk (On-Prem) or S3 (Cloud).

## **6\. Deployment Pipeline**

### **6.1 Build Targets**

1. **Windows:** wails build \-platform windows/amd64 \-\> SENT.exe \+ WebView2Loader.dll.  
2. **macOS:** wails build \-platform darwin/universal \-\> SENT.app.  
3. **Linux/Server:** go build \-tags worker \-\> sent-server (Headless binary).

### **6.2 Update Mechanism**

* **Self-Update:** The application queries the update server on startup. If a new hash is detected, it downloads the differential binary update (using minio/selfupdate).