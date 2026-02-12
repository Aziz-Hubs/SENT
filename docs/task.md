# Remaining Tasks and Feature Roadmap

## Completed (Feb 2026)
- [x] Fix Frontend Build Errors related to Protobuf generation.
- [x] Implement `pulse-client.ts` as adapter for Domain vs Proto types.
- [x] Fix TypeScript type mismatches in `DevicesTable`, `SoftwareTab`.
- [x] Add missing dependencies for UI components (`Slider`, `Skeleton`).
- [x] Generate pure TypeScript code for Protobuf messages and services.
- [x] Ensure production build succeeds (`pnpm run build`).
- [x] Verify no unused imports and syntax errors in dashboard pages.
- [x] Implement robust `DashboardService` handlers (`ListDevices`, `GetStats`, `ListServices`, `ListPatches`).
- [x] Implement `AgentService` handlers for CLI agent communication (CheckIn, UpdateJobStatus).
- [x] Implement `StreamTerminal` and `StreamFileExplorer` RPCs.
- [x] Create Agent core logic and inventory collection.

## Pending Tasks

### 1. Backend Implementation (Partially Complete)
- [ ] Refine `DashboardService` for real-time alerting based on telemetry.
- [ ] Implement `AcknowledgeAlert` backend logic.
- [ ] Implement `RunScript` persistence and mapping.

### 2. Agent (CLI Client)
- [ ] Implement persistent Agent ID storage on the client side.
- [x] Capture telemetry (CPU, RAM, Disk) and inventory.
- [x] Execute scripts and jobs (shell, powershell, services).
- [ ] Implement robust error handling and auto-reconnect for Agent.

### 3. Testing
- [ ] End-to-end test of Agent connecting to Backend.
- [ ] Verify Terminal streaming works end-to-end.
- [ ] Verify File Explorer works end-to-end.

### 4. Integration
- [ ] Configure RustDesk URL in settings.
- [ ] Verify external network connectivity for RustDesk.
