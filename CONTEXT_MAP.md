# 🗺️ SENT Ecosystem: Context Map

_Read this file to understand the architecture without traversing the entire file tree._

## 🏗️ High-Level Architecture

- **Type:** Unified Modular Monolith (Single Binary).
- **Backend:** Go 1.24+ (Wails v2).
- **Frontend:** React 19 + ShadCN/UI (Embedded).
- **Database:** PostgreSQL 16 + TimescaleDB (via `ent` ORM).

## 🛡️ Domain Breakdown

### 1. MSP (Infrastructure)

_The "Nerve Center" for IT Management._

- **SENTpulse (`pkg/pulse`):** RMM Agent. Handles telemetry, remote desktop (WebRTC), and scripting.
- **SENTpilot (`pkg/pilot`):** PSA. Ticketing, billing, and automation playbooks.
- **SENTnexus (`pkg/nexus`):** Documentation. Graph-based dependency mapping.

### 2. SEC (Security)

_The "Shield" against threats._

- **SENTradar (`pkg/radar`):** SIEM. Log ingest and Sigma rule evaluation.
- **SENTshield (`pkg/shield`):** GRC. Compliance reporting (ISO/GDPR).
- **SENTreflex (`pkg/reflex`):** SOAR. Automated incident response.

### 3. ERP (Business)

_The "Engine" of operations._

- **SENTpeople (`pkg/people`):** HRIS. Payroll, Org Charts, Time Off.
- **SENTstock (`pkg/stock`):** Inventory. Warehouse logic, Barcodes, POs.
- **SENTcapital (`pkg/capital`):** Finance. Multi-currency ledger.

## 💾 Core Data Flow

- **ORM:** All services use `ent` generated code in `/ent`.
- **Mutations:** All writes trigger an Audit Log hook in `pkg/database`.
- **Bridge:** Frontend calls Go via `wails.Runtime`. Typed DTOs are in `frontend/src/types`.

## 📍 Key Directories

- `/pkg/database` - DB connection & schema management.
- `/frontend/src/components/ui` - Shared ShadCN components.
- `/ent/schema` - Database definitions (Source of Truth).
