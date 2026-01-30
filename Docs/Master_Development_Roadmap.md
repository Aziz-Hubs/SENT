# **Master Development Roadmap: The SENT Project (2024 - 2026)**

**Version:** 5.0 (Comprehensive Execution Plan)  
**Architecture:** Unified Modular Monolith (Go + Wails + React)  
**Objective:** Deliver a complete, "Dogfoodable" Operating System for the Enterprise by Q3 2026.

---

## **Roadmap Philosophy & Constraints**

1.  **The "Single Binary" Rule:** All features must compile into the single `sent` executable. Worker processes are spawned via `sent --mode=worker --service=X`. No microservices.
2.  **The "Dogfooding" Critical Path:** We cannot build the tool *for* the client until we can use it *ourselves*.
    *   *Constraint:* We cannot pay employees (SENTpeople) until we have a General Ledger (SENTcapital).
    *   *Constraint:* We cannot secure the network (SENTsec) until we can monitor it (SENTmsp).
3.  **Dependency Logic:**
    *   **Identity First:** Zitadel integration is Day 1.
    *   **Data Second:** Ent Schemas for all core entities (Users, Assets, Invoices) must be stabilized early.

---

## **Phase 1: The Foundation (The SENTd Kernel)**
**Timeline:** Q1 2024 - Q2 2024  
**Goal:** Establish the "Operating System" capabilities—build systems, authentication, and local hardware bridges.

### **Q1 2024: Architecture & Identity**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **Repo & Build** | • Initialize Monorepo (Turborepo + Go Workspaces).<br>• Configure `golangci-lint` and `air` for hot-reloading.<br>• Set up **Wails v2** build targets for Windows (`.exe`) and macOS (`.app`). | *None* |
| **Identity Layer** | • Deploy **Zitadel** (Self-Hosted) instance.<br>• Implement OIDC Authorization Code Flow in Wails.<br>• Create `pkg/auth` middleware for Go Chi router. | *Critical* |
| **Data Layer** | • Initialize **Ent** (Entity Framework) Schema.<br>• Set up **Atlas** for declarative migrations.<br>• Define `Tenant` and `User` schemas (Multi-tenancy root). | *Critical* |
| **Frontend Core** | • Scaffold React 19 + Vite frontend.<br>• Implement **TailwindCSS** and **ShadCN/UI**.<br>• Build "App Shell" using ShadCN components (Sidebar, Card, Button). | *None* |

### **Q2 2024: The Native Bridge**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTcore (Worker)** | • Implement CLI flag parsing (`cobra` or `flag`).<br>• Build "Worker Supervisor" to spawn background processes (e.g., `sent --mode=worker`).<br>• Implement OS Signal handling (Graceful Shutdown). | *None* |
| **IPC Bridge** | • Create `pkg/bridge`: Standardized JSON-RPC wrappers for Go<->JS communication.<br>• Benchmark memory-mapped file transfer for large payloads. | *Wails* |
| **Update Engine** | • Implement `minio/selfupdate` logic.<br>• Build "Release Server" to host binaries.<br>• Create "Updater UI" (Progress bar on launch). | *Build* |
| **System Tray** | • Implement native System Tray menu (Right-click -> Quit, Status).<br>• Background "Hide to Tray" logic. | *Wails* |

---

## **Phase 2: SENTerp Alpha (Financial & Physical Operations)**
**Timeline:** Q3 2024 - Q4 2024  
**Goal:** Replace QuickBooks and Inventory systems. Enable the company to operate financially.
**Dogfooding Target:** Finance Dept & Warehouse.

### **Q3 2024: The Ledger (The Source of Truth)**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTcapital** | • **Math:** Integrate `shopspring/decimal` for fixed-point arithmetic.<br>• **Schema:** Define `JournalEntry`, `Account`, `Ledger` Ent schemas.<br>• **Reporting:** Build Trial Balance and P&L generators.<br>• **Banking:** Implement CSV import for bank statements. | *Ent* |
| **SENTvault** | • **Storage:** Integrate **Afero** filesystem abstraction.<br>• **Backend:** Configure Local Disk (Dev) and S3/MinIO (Prod) backends.<br>• **Viewer:** Implement PDF.js for in-app document viewing.<br>• **Link:** Attach "Receipt" files to SENTcapital journal entries. | *Auth* |
| **SENTbridge** | • **Adapter:** Create `pkg/tax` interface.<br>• **Integration:** Build **JoFotara** (Jordan) and **ZATCA** (KSA) XML serializers.<br>• **Crypto:** Implement mTLS and Digital Signature logic for tax APIs. | *Capital* |

### **Q4 2024: Supply Chain & Commerce**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTstock** | • **Scanning:** Integrate **React-Zxing** for webcam barcode decoding.<br>• **Inventory:** Build `Product`, `Warehouse`, `StockMovement` schemas.<br>• **Logic:** "FIFO/LIFO" cost calculation engines linked to SENTcapital. | *Capital* |
| **SENTkiosk** | • **UI:** Build Touch-optimized "Big Button" POS interface.<br>• **Hardware:** Integrate ESC/POS library for thermal receipt printers.<br>• **Cash:** Cash drawer trigger logic (Serial/USB). | *Stock* |

---

## **Phase 3: SENTmsp Beta (Infrastructure Nervous System)**
**Timeline:** Q1 2025 - Q3 2025  
**Goal:** Enable IT and HR to manage the workforce and infrastructure.
**Status:** [COMPLETED]
**Dogfooding Target:** HR & IT Departments.

### **Q1 2025: The People & The Agent**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTpeople** | • **HRIS:** Employee Lifecycle (Hire/Fire) workflows.<br>• **Payroll:** Gross-to-Net calculator engine.<br>• **Org:** D3.js or React Flow visualization for Org Charts.<br>• **Auth:** Sync Employee status with Zitadel (Disable login on termination). | *Capital* |
| **SENTpulse** | • **Agent:** Build standalone `sent-agent` binary using `go-sysinfo`.<br>• **Ingest:** Deploy **TimescaleDB** for high-volume metrics (CPU/RAM).<br>• **Comms:** Secure WebSocket (WSS) tunnel for real-time telemetry. | *Core* |
| **SENTnexus** | • **Graph:** Leverage Ent's Graph capabilities for Asset linking (Server->App).<br>• **Secrets:** Encrypted "Vault" fields for password storage (AES-GCM).<br>• **Sync:** "Auto-Discovery" worker that populates Nexus from Pulse data. | *Pulse* |

### **Q2 2025: Visibility & Control**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENToptic** | • **Stream:** Embed **MediaMTX** binary as a worker service.<br>• **Player:** WebRTC playback component in React.<br>• **Protocol:** RTSP/RTMP ingestion handlers. | *Core* |
| **SENTcontrol** | • **API:** Build Go connectors for **Microsoft Graph API** and **Google Admin SDK**.<br>• **Sync:** "License Reconciler" to match M365 licenses against SENTcapital invoices.<br>• **MFA:** Audit scanner for non-MFA users. | *Nexus* |
| **SENTgrid** | • **SSH:** Build worker pool for SSH/Telnet connections.<br>• **Parsing:** Implement `textfsm` parsing for Cisco/Fortinet/Juniper configs.<br>• **Diff:** Text-diff engine to compare network config backups. | *Nexus* |

### **Q3 2025: Service Operations**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTpilot** | • **Workflow:** Ticket State Machine (New -> Open -> Waiting -> Closed).<br>• **Link:** "Context Sidebar" showing SENTpulse live data for the ticket requester.<br>• **Billing:** Time-entry logging synced to SENTcapital. | *Pulse* |
| **SENThorizon** | • **Viz:** Implement **Recharts** for vCIO dashboards.<br>• **Logic:** "Asset Health Score" algorithm (Age + Ticket Vol + Warranty).<br>• **Report:** PDF Generation for Quarterly Business Reviews. | *Pilot* |
| **SENTwave** | • **Voice:** Embed **Pion WebRTC** for softphone capabilities.<br>• **Signaling:** SIP-over-WebSocket implementation.<br>• **UI:** Dialpad and Call History widget. | *Orbit* |

---

## **Phase 4: SENTsec Integration (Security Immune System)**
**Timeline:** Q4 2025 - Q1 2026  
**Goal:** Turn the telemetry into intelligence. Secure the ecosystem.
**Dogfooding Target:** SOC (Security Operations Center).

### **Q4 2025: Detection & Probing**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTradar** | • **Engine:** Integrate **Expr** for high-speed log evaluation.<br>• **Rules:** Build **Sigma** rule compiler/importer.<br>• **Input:** Syslog (UDP 514) and Windows Event Forwarding (WEF) listeners. | *Pulse* |
| **SENTprobe** | • **Scanner:** Embed **Nuclei** engine and template library.<br>• **Schedule:** Cron-based scanner worker.<br>• **Reporting:** Vulnerability severity scoring logic (CVSS). | *Nexus* |
| **SENTsonar** | • **Packet:** Integrate **Suricata** wrapper for NIDS capabilities.<br>• **Capture:** Libpcap bindings for interface listening.<br>• **Flow:** NetFlow/IPFIX generator logic. | *Grid* |
| **SENTsignal** | • **Intel:** Feed aggregator (OTX, MISP) to download IP blocklists.<br>• **Sync:** Push blocklists to SENTgrid (Firewalls) and SENTguard (Endpoints). | *Radar* |

### **Q1 2026: Defense & Compliance**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTguard** | • **Endpoint:** **Gopacket** integration for process monitoring.<br>• **Kernel:** Sysmon configuration management.<br>• **Action:** Process Kill / Network Isolate RPC commands. | *Pulse* |
| **SENTreflex** | • **Automation:** Implement **River** (Postgres Job Queue).<br>• **Logic:** "Playbook" engine (If Alert X -> Execute Script Y).<br>• **Hooks:** Webhooks for external tool integration. | *Radar* |
| **SENTshield** | • **Compliance:** GRC Framework mapping (NIST <-> Controls).<br>• **Reports:** **Maroto** integration for pixel-perfect Audit PDFs.<br>• **Check:** Auto-validation logic (Query Pulse -> Verify Bitlocker). | *Nexus* |
| **SENTmind** | • **Phish:** SMTP Engine for simulation emails (Gophish architecture).<br>• **LMS:** Video player for security training modules.<br>• **Track:** Click-rate tracking middleware. | *People* |

---

## **Phase 5: Productivity & Growth (The "Dark Launch")**
**Timeline:** Q2 2026  
**Goal:** Replace the office suite. Full company migration to internal tools.
**Dogfooding Target:** All Employees (Marketing, Sales, Execs).

### **Q2 2026: The Business Suite**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTorbit** | • **CRM:** Lead/Deal Pipeline (Kanban).<br>• **Enrich:** Scraping workers for contact enrichment.<br>• **Link:** Integration with SENTmail for activity logging. | *People* |
| **SENTmission** | • **Project:** **SVAR Gantt** React component integration.<br>• **Resourcing:** Resource loading heatmap logic.<br>• **WIP:** Revenue recognition accounting bridge to SENTcapital. | *Pilot* |
| **SENTmail** | • **Client:** **go-imap** (Fetch) and **go-smtp** (Send) integration.<br>• **DB:** Local SQLite/BadgerDB cache for instant search.<br>• **UI:** Unified Inbox and Composer. | *Vault* |
| **SENTchat** | • **Messaging:** **Centrifugo** integration for Pub/Sub.<br>• **Store:** Postgres history + Redis presence.<br>• **UI:** Threaded messaging interface. | *People* |

### **Q2 2026: The Creative Suite & Portal**
| Application / Module | Detailed Tasks & Library Implementation | Dependency |
| :--- | :--- | :--- |
| **SENTmeet** | • **Video:** **Pion** SFU scaling and optimization.<br>• **Feature:** Screen sharing and Recording logic.<br>• **UI:** Grid layout and Audio level visualization. | *Wave* |
| **SENTcal** | • **Sync:** CalDAV client implementation.<br>• **Booking:** Public scheduling link logic (`sent.link/user`). | *Mail* |
| **SENTsheet** | • **Engine:** **Univer** Canvas integration.<br>• **Data:** SQL-to-Sheet connector implementation. | *Capital* |
| **SENTscribe** | • **Editor:** Block-based editor (Tiptap/Editor.js).<br>• **Wiki:** Hierarchical page tree and backlink logic. | *Nexus* |
| **SENTdeck** | • **Canvas:** SVG-based slide rendering engine.<br>• **Data:** Live chart embedding from SENTprism. | *Prism* |
| **SENTcanvas** | • **CMS:** Headless content modeling.<br>• **Builder:** Visual Page Builder for `sent.jo` website.<br>• **API:** Public Content API. | *None* |
| **SENTaccess** | • **Portal:** Client-facing PWA (React).<br>• **Scope:** Restricted "Client View" of Tickets, Invoices, and Projects. | *Pilot* |
| **SENTprism** | • **BI:** **DuckDB** embedded OLAP engine.<br>• **Viz:** Dashboard drag-and-drop builder.<br>• **Connect:** Connectors for all internal Ent schemas. | *Capital* |

---

## **Phase 6: Public Release**
**Timeline:** Q3 2026  
**Goal:** Stabilization, Documentation, and Public Launch.

| Milestone | Deliverables |
| :--- | :--- |
| **Load Testing** | • Simulate 10,000 agents connected to SENTpulse.<br>• Stress test Centrifugo with 1,000 concurrent chat users. |
| **Security Audit** | • External Pen-test of the exposed APIs (SENTaccess).<br>• Code audit of the SENTguard kernel drivers. |
| **Documentation** | • Public Developer Docs (API Reference).<br>• User Manuals (Exported from SENTscribe). |
| **Gold Master** | • Version 1.0.0 Tag.<br>• Binary signing (Code Signing Certificates). |
| **Launch** | • Public website (SENTcanvas) go-live.<br>• Press Release. |

---

## **Tech Stack Summary**

*   **Runtime:** Wails v2 (Go + WebView2/WebKit)
*   **Backend:** Go 1.24+ (Chi, Ent, Atlas, Pion, Centrifugo, Watermill/River)
*   **Frontend:** React 19 (Vite, TailwindCSS, ShadCN/UI, Zustand, React Query)
*   **Database:** PostgreSQL 16 + TimescaleDB (Metrics) + DuckDB (BI)
*   **Specialty:**
    *   **PDF:** Maroto
    *   **Math:** Shopspring/Decimal
    *   **Logs:** Expr + Sigma
    *   **Net:** Gopacket + Suricata
    *   **Scanning:** Nuclei
