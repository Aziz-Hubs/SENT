# Vibe Coding: Claim Domain Shard

// turbo-all

This workflow is for agents taking ownership of an entire domain (MSP, SEC, ERP) for a feature sprint.

1.  **Check Phase:**
    - Read `/PROJECT_STATE.md`.
    - Verify that your target **Domain** (e.g., `MSP`) is NOT claimed by another agent.
    - _Exception:_ You can share `CORE` but must lock specific files.

2.  **Git Phase:**

    ```bash
    git checkout -b vibe/<agent_id>/<domain>-<feature>
    ```

3.  **Claim Phase:**
    - **Option A (Full Lock):** If changing shared domain logic (e.g. `pkg/msp/shared.go`), set **Claimed Modules** to `ALL`. This BLOCKS other agents from this Domain.
    - **Option B (Module Lock):** If working on a specific app (e.g. `pkg/pulse`), set **Claimed Modules** to that specific path. This ALLOWS other agents to work on `pkg/pilot` simultaneously.

4.  **Execute:**
    - You now have exclusive rights to modify `pkg/<domain>/*`.
    - Cross-Platform Validation (`wails build`) is still mandatory.
