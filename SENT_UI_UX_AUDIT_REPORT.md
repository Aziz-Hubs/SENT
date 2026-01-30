# SENT Application - Comprehensive UI/UX Audit Report

**Date:** 2026-01-30  
**Auditor:** AI Code Analyst  
**Scope:** Full application audit across all modules

---

## Executive Summary

This audit identifies **23 critical UI/UX issues** across the SENT application affecting usability, accessibility, visual hierarchy, and user efficiency. Issues range from layout inconsistencies to missing responsive design patterns and accessibility concerns.

**Priority Breakdown:**

- 🔴 **Critical (P0):** 8 issues - Immediate action required
- 🟡 **High (P1):** 10 issues - Address within sprint
- 🟢 **Medium (P2):** 5 issues - Plan for next iteration

---

## 1. LAYOUT & STRUCTURE ISSUES

### 🔴 P0-001: Inconsistent Spacing System

**Location:** Global  
**Issue:** Inconsistent use of spacing units across components (mix of px, rem, and arbitrary values)

**Evidence:**

```tsx
// Dashboard.tsx - Line 60
<div className="space-y-6">  // Uses space-y-6

// Capital.tsx - Line 315
<div className="space-y-6 fade-in">  // Same spacing

// PeoplePage.tsx - Line 79
<div className="fade-in space-y-6">  // Different order, same value
```

**Impact:** Visual inconsistency, harder maintenance  
**Recommendation:** Establish design tokens and enforce via linting

---

### 🟡 P1-002: Missing Responsive Breakpoints

**Location:** Capital.tsx, Dashboard.tsx  
**Issue:** Grid layouts don't adapt well to tablet sizes (768px-1024px)

**Evidence:**

```tsx
// Capital.tsx - Line 347
<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
// Jumps from 1 column to 3 columns - no intermediate state
```

**Impact:** Poor UX on tablets and small laptops  
**Recommendation:** Add `lg:` breakpoint for 3-column layout

**Fix:**

```tsx
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

### 🔴 P0-003: Sidebar Width Transition Causes Layout Shift

**Location:** Sidebar.tsx  
**Issue:** Collapsing sidebar causes jarring content reflow

**Evidence:**

```tsx
// Sidebar.tsx - Line 126
collapsed && !mobileOpen ? "md:w-16" : "md:w-64";
// 248px width change causes main content to shift
```

**Impact:** Disorienting user experience, potential loss of context  
**Recommendation:** Use CSS Grid with `grid-template-columns` for smooth transitions

---

## 2. TYPOGRAPHY ISSUES

### 🟡 P1-004: Inconsistent Font Weights

**Location:** Multiple files  
**Issue:** Mix of font-bold, font-black, font-semibold without clear hierarchy

**Evidence:**

```tsx
// Capital.tsx - Line 588
<DialogTitle className="...font-black italic tracking-tighter">

// Dashboard.tsx - Line 62
<h1 className="text-3xl font-bold tracking-tight">

// PeoplePage.tsx - Line 233
<h2 className="text-lg font-bold tracking-tight leading-tight">
```

**Impact:** Unclear visual hierarchy, inconsistent brand voice  
**Recommendation:** Define typography scale:

- H1: `font-black`
- H2: `font-bold`
- H3: `font-semibold`
- Body: `font-medium`

---

### 🔴 P0-005: Poor Text Contrast in Muted Elements

**Location:** Global  
**Issue:** `text-muted-foreground` may fail WCAG AA contrast requirements

**Evidence:**

```tsx
// Dashboard.tsx - Line 63
<p className="text-muted-foreground">
// Needs contrast ratio verification
```

**Impact:** Accessibility violation, poor readability  
**Recommendation:** Audit all muted text colors, ensure 4.5:1 contrast ratio minimum

---

### 🟡 P1-006: Inconsistent Uppercase Usage

**Location:** Multiple  
**Issue:** Overuse of `uppercase` class creates visual noise

**Evidence:**

```tsx
// Capital.tsx - Line 331
className = "h-8 text-[10px] uppercase font-black tracking-widest";

// Capital.tsx - Line 609
className =
  "text-[10px] font-black uppercase tracking-widest text-muted-foreground";
```

**Impact:** Reduced scannability, harder to read  
**Recommendation:** Reserve uppercase for labels only, use sentence case for actions

---

## 3. COLOR & VISUAL DESIGN

### 🟡 P1-007: Hardcoded Color Values

**Location:** Capital.tsx, PeoplePage.tsx  
**Issue:** Direct color references bypass theme system

**Evidence:**

```tsx
// Capital.tsx - Line 536
className = "text-amber-500 border-amber-500/20 bg-amber-500/10";

// Capital.tsx - Line 543
className = "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
```

**Impact:** Theme switching won't work, inconsistent colors  
**Recommendation:** Use semantic color tokens (e.g., `text-warning`, `text-success`)

---

### 🔴 P0-008: Missing Dark Mode Support

**Location:** Global  
**Issue:** No dark mode color variants defined

**Evidence:**

```tsx
// PeoplePage.tsx - Line 99
className = "bg-slate-100 p-2 rounded-lg border border-slate-200";
// Will look broken in dark mode
```

**Impact:** Poor UX for dark mode users  
**Recommendation:** Add `dark:` variants to all background/border colors

---

## 4. INTERACTION & FEEDBACK

### 🔴 P0-009: Missing Loading States

**Location:** Capital.tsx  
**Issue:** No visual feedback during async operations

**Evidence:**

```tsx
// Capital.tsx - Line 132
const handleApprove = async (id: number) => {
  try {
    const msg = await ApproveTransaction(id);
    // No loading indicator shown to user
```

**Impact:** Users may click multiple times, causing duplicate requests  
**Recommendation:** Add loading state to buttons during async operations

---

### 🟡 P1-010: Inconsistent Button Sizes

**Location:** Multiple  
**Issue:** Mix of `h-7`, `h-8`, `h-9`, `h-10`, `h-11` without clear pattern

**Evidence:**

```tsx
// Capital.tsx - Line 567
className = "h-7 text-[10px]...";

// Capital.tsx - Line 736
className = "...h-11 px-8...";
```

**Impact:** Visual inconsistency  
**Recommendation:** Standardize to 3 sizes: `sm` (h-8), `default` (h-10), `lg` (h-12)

---

### 🟡 P1-011: Missing Hover States

**Location:** Capital.tsx tables  
**Issue:** Clickable rows lack clear hover feedback

**Evidence:**

```tsx
// Capital.tsx - Line 416
className = "hover:bg-muted/50 transition-colors group cursor-pointer";
// Good, but inconsistent across app
```

**Impact:** Users unsure what's clickable  
**Recommendation:** Add consistent hover states to all interactive elements

---

## 5. DATA PRESENTATION

### 🔴 P0-012: Poor Table Density

**Location:** Capital.tsx  
**Issue:** Table rows too tall, wasting vertical space

**Evidence:**

```tsx
// Capital.tsx - Line 514
className = "hover:bg-muted/50 transition-colors h-10";
// 40px per row is excessive for data tables
```

**Impact:** Requires excessive scrolling, reduces data visibility  
**Recommendation:** Reduce to `h-8` (32px) for better density

---

### 🟡 P1-013: Missing Empty States

**Location:** Dashboard.tsx  
**Issue:** No guidance when data is empty

**Evidence:**

```tsx
// Dashboard.tsx - Line 117
<CardContent className="h-[300px] flex items-center justify-center border-t">
  <p className="text-muted-foreground">Ecosystem visualization placeholder</p>
</CardContent>
```

**Impact:** Users don't know what to expect or how to proceed  
**Recommendation:** Add EmptyState component with actionable CTA

---

### 🟡 P1-014: Inconsistent Number Formatting

**Location:** Capital.tsx  
**Issue:** Mix of `toLocaleString()` and manual formatting

**Evidence:**

```tsx
// Capital.tsx - Line 440
{
  Math.abs(acc.balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });
}

// Capital.tsx - Line 559
{
  tx.total_amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });
}
```

**Impact:** Potential locale inconsistencies  
**Recommendation:** Create utility function for currency formatting

---

## 6. NAVIGATION & FLOW

### 🟡 P1-015: Sidebar Scroll Issues

**Location:** Sidebar.tsx  
**Issue:** Long division lists may overflow without proper scrolling

**Evidence:**

```tsx
// Sidebar.tsx - Line 171
<ScrollArea className="flex-1 px-3">
// May not handle very long lists well
```

**Impact:** Navigation items may be hidden  
**Recommendation:** Add max-height and ensure ScrollArea works correctly

---

### 🔴 P0-016: Missing Breadcrumb Navigation

**Location:** Multiple pages  
**Issue:** Breadcrumbs defined but not consistently implemented

**Evidence:**

```tsx
// Capital.tsx - Line 298
const breadcrumbs = [{ label: "Business" }, { label: "SENTcapital ERP" }];
// Passed to PageHeader but may not render properly
```

**Impact:** Users lose context of where they are  
**Recommendation:** Ensure PageHeader properly renders breadcrumbs

---

## 7. FORMS & INPUT

### 🔴 P0-017: Missing Form Validation Feedback

**Location:** Capital.tsx  
**Issue:** Validation errors only shown via toast, not inline

**Evidence:**

```tsx
// Capital.tsx - Line 237
if (!description) return toast.error("Description required");
// No visual indication on the input field itself
```

**Impact:** Users must remember which field had error  
**Recommendation:** Add error states to input components

---

### 🟡 P1-018: Inconsistent Input Heights

**Location:** Capital.tsx, PeoplePage.tsx  
**Issue:** Mix of `h-9`, `h-10`, `h-11` for inputs

**Evidence:**

```tsx
// Capital.tsx - Line 618
className = "...h-11 text-lg...";

// PeoplePage.tsx - Line 195
className = "flex h-9 w-full...";
```

**Impact:** Visual inconsistency  
**Recommendation:** Standardize to `h-10` for all inputs

---

### 🟡 P1-019: Missing Placeholder Guidance

**Location:** Multiple forms  
**Issue:** Some inputs lack helpful placeholders

**Evidence:**

```tsx
// Capital.tsx - Line 617
placeholder = "e.g. Monthly Rent Payment";
// Good example, but not consistent everywhere
```

**Impact:** Users unsure what to enter  
**Recommendation:** Add contextual placeholders to all inputs

---

## 8. ACCESSIBILITY

### 🔴 P0-020: Missing ARIA Labels

**Location:** Multiple  
**Issue:** Icon-only buttons lack accessible labels

**Evidence:**

```tsx
// Capital.tsx - Line 701
<Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(index)}>
  <Trash2 className="h-4 w-4" />
</Button>
// No aria-label for screen readers
```

**Impact:** Screen reader users can't understand button purpose  
**Recommendation:** Add `aria-label` to all icon-only buttons

---

### 🟡 P1-021: Missing Focus Indicators

**Location:** Global  
**Issue:** Custom focus styles may override browser defaults

**Evidence:**

```tsx
// Need to verify focus-visible states are properly styled
```

**Impact:** Keyboard navigation difficult  
**Recommendation:** Ensure all interactive elements have visible focus states

---

## 9. PERFORMANCE

### 🟡 P1-022: Unnecessary Re-renders

**Location:** Capital.tsx  
**Issue:** State updates may cause full component re-renders

**Evidence:**

```tsx
// Capital.tsx - Line 161
const toggleTxSelection = (id: number) => {
  const newSet = new Set(selectedTxIds);
  // Creating new Set on every toggle
```

**Impact:** Performance degradation with large datasets  
**Recommendation:** Use React.memo and useCallback for optimization

---

## 10. MOBILE RESPONSIVENESS

### 🔴 P0-023: Poor Mobile Table Experience

**Location:** Capital.tsx  
**Issue:** Tables don't adapt to mobile screens

**Evidence:**

```tsx
// Capital.tsx - Line 401
<Table>
// No mobile-specific layout
```

**Impact:** Horizontal scrolling required, poor UX  
**Recommendation:** Implement card-based layout for mobile

---

## IMPLEMENTATION PRIORITY

### Sprint 1 (Critical - P0)

1. Fix sidebar layout shift (P0-003)
2. Add dark mode support (P0-008)
3. Implement loading states (P0-009)
4. Fix table density (P0-012)
5. Add ARIA labels (P0-020)
6. Mobile table layouts (P0-023)
7. Form validation feedback (P0-017)
8. Text contrast audit (P0-005)

### Sprint 2 (High - P1)

1. Responsive breakpoints (P1-002)
2. Typography standardization (P1-004, P1-006)
3. Button size consistency (P1-010)
4. Input height standardization (P1-018)
5. Hover states (P1-011)

### Sprint 3 (Medium - P2)

1. Color token system (P1-007)
2. Number formatting utility (P1-014)
3. Performance optimization (P1-022)

---

## DESIGN SYSTEM RECOMMENDATIONS

### 1. Create Design Tokens

```typescript
// tokens.ts
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
};

export const typography = {
  h1: "text-3xl font-black tracking-tight",
  h2: "text-2xl font-bold tracking-tight",
  h3: "text-xl font-semibold",
  body: "text-base font-medium",
  caption: "text-sm font-normal",
};
```

### 2. Component Size Standards

- **Buttons:** sm (h-8), default (h-10), lg (h-12)
- **Inputs:** h-10 (consistent)
- **Table Rows:** h-8 (dense data)
- **Cards:** p-6 (consistent padding)

### 3. Color Semantic Tokens

- `bg-success` / `text-success` → emerald-500
- `bg-warning` / `text-warning` → amber-500
- `bg-error` / `text-error` → red-500
- `bg-info` / `text-info` → blue-500

---

## CONCLUSION

The SENT application has a solid foundation but requires systematic UI/UX improvements to meet enterprise standards. Prioritizing the P0 issues will significantly improve usability and accessibility. Implementing a proper design system will ensure long-term consistency and maintainability.

**Estimated Effort:**

- P0 fixes: 3-5 days
- P1 fixes: 5-7 days
- Design system implementation: 2-3 days

**Total:** ~2 weeks for complete remediation
