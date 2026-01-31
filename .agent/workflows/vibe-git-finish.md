# Vibe Coding: Finish & Push

// turbo-all

This workflow handles the safe completion of a Vibe Coding task.

1.  **Verify Cross-Platform Builds:**
    Ensure the project compiles for both target platforms:
    ```bash
    wails build -platform windows/amd64
    wails build -platform linux/amd64
    ```
2.  **Stage & Commit:**
    ```bash
    git add .
    git commit -m "feat: <concise_task_summary>"
    ```
3.  **Push Branch:**
    ```bash
    git push origin HEAD
    ```
4.  **Update Registry:**
    - Edit `/PROJECT_STATE.md`.
    - Move your entry from **Active Agent Registry** to **Coordination Logs**.
    - Include the Pull Request link (or branch name) in the log.
5.  **Handover:** Notify the user that the branch is ready for review.
