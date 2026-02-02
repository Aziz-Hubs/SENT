# Implementation Status

**Last Updated:** February 2026
**Branch:** MVP

This document tracks the actual implementation state of the SENT ecosystem modules against the "Vision" documentation.

## 🟢 Implemented (MVP)

These modules exist in the codebase (`backend/internal/divisions` and `frontend/src/pages`).

### MSP Division
- **SENTpulse** (`pkg/pulse`, `pages/msp/pulse`) - RMM Agent & Dashboard.
- **SENTpilot** (`pkg/pilot`, `pages/msp/pilot`) - PSA/Ticketing.

### ERP Division
- **SENTpeople** (`pkg/people`, `pages/erp/people`) - HRIS.
- **SENTstock** (`pkg/stock`, `pages/erp/stock`) - Inventory & POS.
- **SENTcapital** (`pkg/capital`, `pages/erp/capital`) - Finance/Ledger.

### CORE Division
- **Auth Layer** (`internal/platform/auth`) - OIDC/Zitadel integration.
- **Unified Bridge** (`internal/app/rpc`, `src/lib/api`) - Supports Desktop & Web clients. [Technical Guide](./Technical_Guide_RPC_Bridge.md)

## 🟡 Planned / Roadmap (Not in Codebase)

These modules are described in the Architecture docs but are not yet present in the `MVP` branch.

### MSP Division
- **SENTnexus** (Documentation)
- **SENThorizon** (vCIO)
- **SENTcontrol** (SaaS Mgmt)
- **SENToptic** (CCTV)
- **SENTgrid** (Net Mgmt)
- **SENTwave** (VoIP)

### SEC Division (Entire Division)
- **SENTradar** (SIEM)
- **SENTshield** (GRC)
- **SENTreflex** (SOAR)
- **SENTprobe** (Vuln Scan)
- **SENTguard** (EDR)
- **SENTmind** (Training)
- **SENTsignal** (Intel)
- **SENTsonar** (NIDS)

### ERP Division
- **SENTmission** (Projects)
- **SENTorbit** (CRM)
- **SENTmail**
- **SENTchat**
- **SENTmeet**
- **SENTcal**
- **SENTscribe**
- **SENTsheet**
- **SENTdeck**
- **SENTcanvas**
- **SENTaccess**
- **SENTprism**
- **SENTbridge**
- **SENTvault**

## 🔴 Discrepancies Noted

- **Docs/UI_STORYBOOK.md**: Claims "Synced" status for modules that do not exist yet.
- **Docs/Master Technical Architecture.md**: Mentions "Go Workspaces" and "Turborepo" (Removed in recent update).
