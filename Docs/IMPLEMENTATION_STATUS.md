# Implementation Status (Web Transition)

**Last Updated:** February 2, 2026 (Refactor to Next.js)
**Branch:** MVP

## 🟢 Status: Migrating to Next.js + Pure Go API

The project is currently undergoing a total architectural shift from **Wails (Desktop)** to **Next.js (Web)**.

### CORE Division
- **API Server** (`backend/main.go`) - Converted to pure Echo server (No Wails).
- **RPC Dispatcher** (`backend/internal/app/rpc`) - Operational.
- **Frontend** (`frontend/`) - Next.js 15 Scaffolded.

### ERP Division (Pending UI Migration)
- **SENTcapital** - Backend logic active. UI needs porting to Next.js.
- **SENTstock** - Backend logic active. UI needs porting to Next.js.
- **SENTpeople** - Backend logic active. UI needs porting to Next.js.

### MSP Division (Pending UI Migration)
- **SENTpulse** - Backend logic active. UI needs porting to Next.js.
- **SENTpilot** - Backend logic active. UI needs porting to Next.js.

## 🔴 Removed
- **Wails V2** - Completely discarded.
- **Vite/React Native Shell** - Replaced by Next.js.
