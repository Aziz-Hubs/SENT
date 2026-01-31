# 🌐 SENT Ecosystem: Global Shared Memory

## 🛡️ Domain Shards

_To maximize velocity, you can lock a specific **Module** instead of the whole Domain._

| Domain                   | Modules (Micro-Shards)                                            |
| :----------------------- | :---------------------------------------------------------------- |
| **MSP** (Infrastructure) | `pkg/pulse`, `pkg/pilot`, `pkg/nexus`, `pkg/optic`, `pkg/control` |
| **SEC** (Security)       | `pkg/radar`, `pkg/shield`, `pkg/reflex`, `pkg/guard`              |
| **ERP** (Business)       | `pkg/people`, `pkg/stock`, `pkg/capital`, `pkg/mission`           |
| **CORE** (Shared)        | `pkg/database`, `frontend/src/components`, `ent/`, `main.go`      |

## 🚥 Active Agent Registry

_Rules: Update your timestamp every 5-10 minutes. If an entry is >15 mins old, it is considered STALE and can be removed._

| Agent ID | Task | Domain | Claimed Modules/Files | Branch | Status | Last Updated |
| :------- | :--- | :----- | :-------------------- | :----- | :----- | :----------- |
|          |      |        |                       |        |        |              |

## 🏗️ Architectural Guardrails

- **ORM:** Use `ent` for all database interactions. Do not use raw SQL unless performance-critical.
- **Frontend:** React 19 + ShadCN/UI. Components should be placed in `@/components/ui` if generic.
- **Backend:** All new Go services must support the `--mode=worker` flag for scaling.
- **Bridge:** JS-to-Go binding via Wails should use `pkg/app.go` as the primary entry point.

## ⚒️ Engineering Guidelines (Cross-Platform)

- **Multi-OS Support:** Every feature MUST be validated for both **Linux** and **Windows**.
- **Compilation:** Use `wails build -platform windows/amd64` and `wails build -platform linux/amd64` to verify types.
- **OS-Specific Logic:** Use build tags (`// +build windows`) or `runtime.GOOS` checks to ensure code doesn't crash on non-target platforms (e.g., when calling PowerShell vs. Bash).
- **Frontend Types:** Ensure `Wails` generated types are used in the frontend to prevent TS compilation errors.

## 📍 Coordination Logs

- [2026-01-31 16:16] `Antigravity`: Implemented Context Map and TDD Workflows.
- [2026-01-31 16:15] `Antigravity`: Implemented Sharded Vibe Protocol (Micro-Sharding).
- [2026-01-31 16:08] `Antigravity`: Added Cross-Platform Engineering Guidelines to Guardrails.
- [2026-01-31 16:03] `Antigravity`: Upgraded Coordination Protocol to Git-based Feature Branches.
- [2026-01-31 15:58] `Antigravity`: Added 'Last Updated' column for lock handling.

- [ ] Wails build for `windows/amd64` currently running (monitoring for status).
- [ ] Frontend type mismatches in `TransactionDTO` need addressing.
