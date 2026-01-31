# Vibe Coding: Start Feature Branch

// turbo-all

This workflow handles the safe initialization of a new Vibe Coding task.

1.  **Check Registry:** Review `/PROJECT_STATE.md` to ensure your target module is not claimed.
2.  **Generate Branch Name:** Construct a branch name using the format: `vibe/{agent-id}/{task-slug}`.
    - Example: `vibe/antigravity/refactor-auth`
3.  **Create Branch:**
    ```bash
    git checkout -b <branch_name>
    ```
4.  **Register Task:** Update `/PROJECT_STATE.md` with your Agent ID, Task, Claimed Files, and Branch Name.
5.  **Start Coding:** You are now safe to proceed.
