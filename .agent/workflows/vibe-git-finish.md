# Vibe Coding: Finish & Push

// turbo-all

This workflow handles the safe completion of a Vibe Coding task.

1.  **Stage & Commit:**
    ```bash
    git add .
    git commit -m "feat: <concise_task_summary>"
    ```
2.  **Push Branch:**
    ```bash
    git push origin HEAD
    ```
3.  **Update Registry:**
    - Edit `/PROJECT_STATE.md`.
    - Move your entry from **Active Agent Registry** to **Coordination Logs**.
    - Include the Pull Request link (or branch name) in the log.
4.  **Handover:** Notify the user that the branch is ready for review.
