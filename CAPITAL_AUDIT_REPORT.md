# 🛡️ SENTcapital Red Team Usability Audit

**Date:** 2026-01-29  
**Auditor:** SENT AI (Deepmind Advanced Coding Agent)  
**Module:** `frontend/src/pages/Capital.tsx`  
**Focus:** Financial UI/UX Stress Test

---

## 1. Persona Profiles

### 👤 Persona A: "The Controller" (Head of Accounting)

- **Mindset:** "Zero Tolerance for Imbalance."
- **Workflow:** Opens the Ledger at 8:00 AM. needs to reconcile 500+ staged transactions before 10:00 AM board meeting. Uses keyboard exclusively (Tab, Enter, Arrow Keys).
- **Frustrations with Current State:**
  - **Click Fatigue:** "I have to click 'Approve' on every single line? I have 500 lines. That's 500 clicks. Where is the 'Select All > Approve'?"
  - **Trust Issues:** "I just blindly posted a Journal Entry with $2500 Debit and $0 Credit. The system didn't stop me. This breaks basic accounting principles."
  - **Density:** "I can only see 10 rows at a time because of the whitespace. I need to see 50."

### 👤 Persona B: "The FP&A Analyst" (Financial Planning & Analysis)

- **Mindset:** "Trends over Transactions."
- **Workflow:** Needs to answer "Why is 'Marketing' 20% over budget this month?" in 30 seconds.
- **Frustrations with Current State:**
  - **Dead Ends:** "The 'Expenses (MTD)' card shows me a number. I click it, nothing happens. I want to click it and see a filtered view of the Ledger for Expense accounts."
  - **Context Switching:** "I have to download a PDF (P&L) just to see the breakdown? Why isn't there a visualization right here?"

---

## 2. Financial Health Score: 38/100 (CRITICAL)

| Metric                      | Score      | Reasoning                                                                                                                     |
| :-------------------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Error Prevention**        | **0/100**  | **CRITICAL FAIL:** The system allows posting unbalanced Journal Entries (Debits ≠ Credits). This corrupts the General Ledger. |
| **Reconciliation Velocity** | **20/100** | No batch operations. Single-row approval is non-viable for enterprise volume.                                                 |
| **Data Readability**        | **65/100** | Good use of `font-mono`, but density is too low (standard UI padding) for power users.                                        |
| **Audit Compliance**        | **50/100** | Basic immutable log exists, but no "Who modified this?" or "Original vs Current" tracking visible.                            |

---

## 3. Audit Matrix & Findings

### 🔴 Critical Findings (Must Fix Immediately)

1.  **Unbalanced Journal Entries:**
    - **Location:** `handleSubmit` (Lines 188-219).
    - **Issue:** The validation checks for _empty_ fields but ignores the fundamental accounting equation: `SUM(Debits) must equal SUM(Credits)`.
    - **Exploit:** A user can debit Cash $1,000,000 and credit nothing, artificially inflating assets.

2.  **Missing Batch Approvals:**
    - **Location:** `TabsContent value="ledger"` (Lines 363-453).
    - **Issue:** No checkboxes on table rows. `handleApprove` accepts a single `id`.
    - **Impact:** Reconciling a day's worth of transactions (e.g., 50 items) takes ~10 minutes instead of 10 seconds.

### 🟡 UX Frictions (High Priority)

1.  **Standard Table Density:**
    - **Issue:** Uses default ShadCN `p-4` (implied).
    - **Recommendation:** Create a `compact` variant for `TableCell` (`p-2`, `h-8`) specifically for the Ledger.

2.  **Typography Mismatch:**
    - **Issue:** Uses `font-mono` which is good, but standard Tailwind `tabular-nums` is preferred on the base font (Inter/Sans) for a more premium feel unless it's strictly code. `font-mono` creates visual friction when mixed with standard UI text.

3.  **Static Summary Cards:**
    - **Location:** `SummaryCard` (Lines 717-734).
    - **Issue:** Cards are purely display.
    - **Recommendation:** Make them interactive filters. Clicking "Expenses" should filter the Ledger tab to `type="expense"`.

---

## 4. Visual & Code Recommendations

### Recommended `handleSubmit` Validation Update

```typescript
// PROPOSED FIX
const totalDebits = entries
  .filter((e) => e.direction === "debit")
  .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

const totalCredits = entries
  .filter((e) => e.direction === "credit")
  .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

if (Math.abs(totalDebits - totalCredits) > 0.01) {
  return toast.error(
    `Unbalanced Entry! Delta: $${(totalDebits - totalCredits).toFixed(2)}`,
  );
}
```

### Aesthetic Upgrades for Tables

- **Numbers:** Apply `tabular-nums tracking-tight font-medium` instead of raw `font-mono`.
- **Negative Values:** Apply `text-red-500` automatically if `amount < 0` (or based on Debit/Credit logic).
- **Sticky Headers:**
  ```tsx
  <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  ```

### Interactive Drill-Down Plan

- Convert `SummaryCard` to take an `onClick` prop.
- Update `Capital` component state to include `filterType` (e.g., `useState<'all' | 'asset' | 'revenue' | 'expense'>('all')`).
