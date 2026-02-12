# SENT Frontend - Developer Onboarding Guide

Welcome to the SENT frontend monorepo! This guide will help you understand the project structure and get started with development.

## Quick Start

```powershell
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Type checking
pnpm run type-check
```

The dev server runs at **http://localhost:3000**

---

## Architecture Overview

This is a **Turborepo monorepo** with the following structure:

```
frontendv2/
├── apps/
│   └── sent-platform/      # Main Next.js 16 application
│
└── packages/
    ├── platform-ui/        # @sent/platform-ui - Shared design system
    ├── feature-sent-msp/   # @sent/feature-sent-msp - MSP business logic
    ├── feature-sent-erp/   # @sent/feature-sent-erp - ERP business logic
    ├── feature-sent-sec/   # @sent/feature-sent-sec - SEC businesslogic
    └── feature-sent-core/  # @sent/feature-sent-core - Core business logic
```

### Why Monorepo?

- **Shared code** - Components and utilities are shared across features
- **Atomic commits** - Changes to UI + business logic ship together
- **Consistent tooling** - TypeScript, ESLint, and Tailwind configs are shared

---

## Package Reference

### `@sent/platform-ui` (Design System)

The centralized design system based on **ShadCN/UI**. All visual components live here.

**Key files:**
| File                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `src/globals.css`     | CSS variables for light/dark themes                  |
| `src/lib/utils.ts`    | `cn()` utility for Tailwind class merging            |
| `src/components/ui/*` | ShadCN primitives (Button, Card, Input, etc.)        |
| `src/components/layout/*` | Shared Layouts (AppShell, Sidebar, CommandPalette) |
| `tailwind.config.ts`  | Master Tailwind config (all apps use this as preset) |
| `components.json`     | ShadCN CLI configuration                             |

**Usage:**
```tsx
import { Button, Card, cn } from "@sent/platform-ui";
```

**Adding new ShadCN components:**

**Option 1: From anywhere in the monorepo (recommended):**
```powershell
pnpm run ui:add dialog   # Works from ANY directory!
pnpm run ui:add input
pnpm run ui:add button
```

**Option 2: From the platform-ui directory:**
```powershell
cd packages/platform-ui
pnpm dlx shadcn@latest add dialog
```

> **Note**: The `components.json` file lives in `packages/platform-ui`. The `ui:add` script automatically targets that package.

---

### Feature Packages

Each division has its own package for business logic and feature-specific components.

| Package                   | Division  | Example Modules               |
| ------------------------- | --------- | ----------------------------- |
| `@sent/feature-sent-msp`  | MSP       | Pulse, Pilot, Nexus, Horizon  |
| `@sent/feature-sent-erp`  | ERP       | Capital, Orbit, People, Vault |
| `@sent/feature-sent-sec`  | Security  | Radar, Shield, Reflex, Probe  |
| `@sent/feature-sent-core` | Corporate | Admin, Settings               |

**Feature package structure:**
```
feature-sent-msp/
└── src/
    ├── index.ts              # Public API exports
    └── sent-msp-pulse/       # Module folder
        ├── index.ts          # Module exports
        └── TicketList.tsx    # Component
```

**Usage in app:**
```tsx
import { TicketList } from "@sent/feature-sent-msp";
```

---

## Main Application (`apps/sent-platform`)

### Route Structure

```
src/app/
├── layout.tsx              # Root layout (imports globals.css)
├── page.tsx                # Landing page (/)
│
└── (dashboard)/            # Route group (no URL segment)
    ├── layout.tsx          # Minimal dashboard wrapper (Platform provider)
    ├── sent-msp/
    │   ├── page.tsx        # /sent-msp (App Hub - Listing)
    │   └── sent-pulse/     # /sent-msp/sent-pulse (RMM Sub-module)
    │       ├── layout.tsx  # Injects AppShell + RMM Sidebar
    │       └── page.tsx    # RMM Dashboard
    ├── sent-erp/page.tsx   # /sent-erp
    ├── sent-sec/page.tsx   # /sent-sec
    └── sent-core/page.tsx  # /sent-core
```

### App Hubs & Sub-Modules

The platform uses a **Hub & Spoke** navigation model:

1.  **App Hubs (`/sent-msp`)**: Landing pages that list available applications within a division.
2.  **Sub-Modules (`/sent-msp/sent-pulse`)**: Fully featured applications with their own dedicated sidebar and navigation.
    *   These modules use the `AppShell` from `@sent/platform-ui`.
    *   They inject their own `nav-config.ts` to populate the sidebar.

### Key Configurations

| File                 | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `next.config.mjs`    | `transpilePackages` for our workspace packages     |
| `tailwind.config.ts` | Uses `@sent/platform-ui/tailwind.config` as preset |
| `tsconfig.json`      | Path aliases (`@/*` → `./src/*`)                   |

---

## Development Workflow

### Creating a New Component in platform-ui

1. Create file in `packages/platform-ui/src/components/ui/`
2. Export from `packages/platform-ui/src/index.ts`
3. Import with `import { MyComponent } from "@sent/platform-ui"`

### Creating a New Feature Module

1. Add folder in appropriate feature package: `packages/feature-sent-msp/src/my-module/`
2. Create component files and `index.ts` for exports
3. Re-export from package root: `packages/feature-sent-msp/src/index.ts`
4. Import with `import { MyComponent } from "@sent/feature-sent-msp"`

### Creating a New Route

1. Create folder in `apps/sent-platform/src/app/(dashboard)/my-route/`
2. Add `page.tsx` with default export
3. Route is automatically available at `/my-route`

---

## Styling Guide

### CSS Variables (Theme)

All theme colors are defined as CSS variables in `globals.css`:

```css
--primary: 221.2 83.2% 53.3%;   /* HSL values */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
```

Use via Tailwind classes: `bg-primary`, `text-foreground`, `border-border`

### Class Merging

Always use `cn()` when combining Tailwind classes:

```tsx
import { cn } from "@sent/platform-ui";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Props override
)} />
```

---

## Commands Reference

| Command                                      | Scope    | Description                 |
| -------------------------------------------- | -------- | --------------------------- |
| `pnpm run dev`                               | All      | Start all apps in dev mode  |
| `pnpm run build`                             | All      | Build all packages and apps |
| `pnpm run type-check`                        | All      | TypeScript validation       |
| `pnpm run lint`                              | All      | ESLint check                |
| `pnpm --filter=sent-platform dev`            | App only | Run just the main app       |
| `pnpm --filter=@sent/platform-ui type-check` | Package  | Check single package        |

---

## Tech Stack Summary

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | Next.js 16 (App Router + Turbopack) |
| Language        | TypeScript 5.9                      |
| Build           | Turborepo 2.8                       |
| Package Manager | pnpm 9                              |
| Styling         | TailwindCSS 3.4                     |
| Components      | ShadCN/UI (Radix primitives)        |
| Icons           | Lucide React                        |

---

## Questions?

Refer to these resources:
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [ShadCN/UI Components](https://ui.shadcn.com)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
