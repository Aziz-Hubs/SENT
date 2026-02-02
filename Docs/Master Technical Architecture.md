# **SENT LLC - Master Technical Architecture**

**Version:** 4.2 (Hybrid RPC Specification)

**Architecture Style:** Unified Modular Monolith (Native Desktop & Hybrid Cloud)

**Repository Strategy:** Monorepo (Frontend/Backend Split)

**Target Launch:** Q3 2026

## **1. Architectural Vision: "The Native Singularity"**

The SENT ecosystem utilizes a **Unified Modular Monolith** architecture. It is designed to run as both a **Native Desktop Application** (via Wails v2) and a **Cloud-Hosted Web Application**.

### **1.1 The "Unified Bridge" Pattern**

SENT uses a **Dual-Transport Architecture** to support both Native Desktop and Cloud Web clients from a single codebase.

1.  **The Transport Layer:**
    *   **Desktop:** Uses **Wails IPC** (Memory-mapped, zero latency) for offline-first performance.
    *   **Web:** Uses **JSON-RPC over HTTP** (`POST /api/rpc`) to expose the exact same Go methods to the browser.
2.  **The Frontend Client:**
    *   A **"Magic Proxy"** in TypeScript automatically detects the environment.
    *   If `window.runtime` exists -> Calls Wails.
    *   If not -> Calls HTTP.
    *   This ensures zero code duplication for API calls across 500+ methods.

## **2. Core Technology Stack (Universal Layers)**

| Layer               | Technology            | Implementation Detail                                                                              |
| :------------------ | :-------------------- | :------------------------------------------------------------------------------------------------- |
| **Desktop Runtime** | **Wails v2**          | Handles window management, native menus, and the JS-to-Go binding. Generates .exe, .app, and .deb. |
| **Core Backend**    | **Go (Golang) 1.24+** | Handles business logic, database connections, and background routines. Located in `backend/`.      |
| **Frontend UI**     | **React 19 + Vite**  | Compiled into static assets and embedded directly into the Go binary. Located in `frontend/`.      |
| **Components**      | **ShadCN/UI**         | Re-usable component system based on Radix UI and Tailwind. Code is copied, not imported.           |
| **Styling**         | **TailwindCSS**       | Utility-first styling for rapid UI development.                                                    |
| **Database**        | **PostgreSQL 16**     | Primary relational store. Hosted externally (Cloud/On-Prem) or locally via Docker.                 |
| **Time-Series**     | **TimescaleDB**       | Extension enabled on Postgres for high-ingest telemetry (logs, metrics).                           |
| **Data Access**     | **PGX & SQLc**        | Fast, type-safe SQL code generation defined by standard SQL queries. Replaces Ent.                 |
| **Migrations**      | **Atlas**             | Declarative schema migration management for Postgres.                                              |
| **Auth**            | **Zitadel**           | OIDC Provider. Handles SSO, MFA, and Audit Trails.                                                 |

## **3. Workload Isolation Strategy (The "Noisy Neighbor" Fix)**

To prevent resource-heavy features (Video Conferencing, Log Analysis) from slowing down critical business operations (ERP Ledger), we employ a **Runtime Mode** strategy. The same binary is used, but initialized differently based on flags.

### **3.1 Mode A: Desktop Client (User Facing)**

* **Command:** ./sent-app  
* **Role:** Renders the UI, handles user input, lightweight local tasks.  
* **Resource Priority:** High UI responsiveness.

### **3.2 Mode B: Isolated Worker (Server Side)**

* **Command:** ./sent-app --mode=worker --service=meet  
* **Role:** Runs headless (no UI). Dedicated to processing specific high-load queues.  

## **4. Data Architecture (PostgreSQL + SQLc)**

### **4.1 The Unified Schema**

All applications share a single database schema managed by raw SQL migrations.

* **Tenancy:** Every table includes organization_id for strict isolation, enforced reliably at the query level.
* **Global Interceptor:** A centralized **MW Wrapper** (`pkg/database/postgres.go`) intercepts all mutations across all nine apps to generate immutable entries in the `AuditLog` hypertable automatically.
* **Hypertables:** Tables for device_metrics and security_logs are converted to TimescaleDB hypertables for automatic partitioning.
* **Encryption:** Sensitive fields (Passwords, PII, Payroll) utilize **AES-256-GCM** authenticated encryption with hardware-accelerated CPU instructions.

## **5. Deployment Pipeline**

### **5.1 Build Targets**

1. **Windows:** `wails build -platform windows/amd64` -> SENT.exe + WebView2Loader.dll.  
2. **macOS:** `wails build -platform darwin/universal` -> SENT.app.  
3. **Linux/Server:** `go build -tags worker` -> sent-server (Headless binary).
