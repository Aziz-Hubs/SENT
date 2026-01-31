# 🌐 SENT Ecosystem: Global Shared Memory

## 🚥 Active Agent Registry

_Rules: Update your timestamp every 5-10 minutes. If an entry is >15 mins old, it is considered STALE and can be removed._

| Agent ID      | Task                            | Claimed Modules/Files | Branch                         | Status    | Last Updated |
| :------------ | :------------------------------ | :-------------------- | :----------------------------- | :-------- | :----------- |
| `Antigravity` | Upgrading Coordination Protocol | `/PROJECT_STATE.md`   | `vibe/antigravity/git-upgrade` | 💻 Coding | 16:03        |

## 🏗️ Architectural Guardrails

- **ORM:** Use `ent` for all database interactions. Do not use raw SQL unless performance-critical.
- **Frontend:** React 19 + ShadCN/UI. Components should be placed in `@/components/ui` if generic.
- **Backend:** All new Go services must support the `--mode=worker` flag for scaling.
- **Bridge:** JS-to-Go binding via Wails should use `pkg/app.go` as the primary entry point.

## 📍 Coordination Logs

- [2026-01-31 15:58] `Antigravity`: Added 'Last Updated' column to handle stale locks.
- [2026-01-31 15:56] `Antigravity`: Initialized project state for vibe coding coordination.

## ⚠️ Known Technical Debt / Blockers

- [ ] Wails build for `windows/amd64` currently running (monitoring for status).
- [ ] Frontend type mismatches in `TransactionDTO` need addressing.
