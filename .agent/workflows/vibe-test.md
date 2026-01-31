# Vibe Coding: Test-Driven Development (TDD)

// turbo-all

This workflow enforces Quality Assurance by ensuring tests exist _before_ implementation.

1.  **Red (Write Test):**
    - Locate the test file for your module (e.g., `pkg/pulse/agent/logs_test.go`).
    - Write a test case that defines the expected behavior of the new feature.
    - Run the test to confirm it FAILS (compilation error or assertion failure).
    - `go test ./pkg/pulse/agent/...`

2.  **Green (Make it Pass):**
    - Write the _minimum_ amount of code in the implementation file to satisfy the test.
    - Run the test again to confirm it PASSES.

3.  **Refactor (Optimize):**
    - Clean up the code, improve variable names, or optimize performance.
    - Run the test again to ensure NO REGRESSION.
