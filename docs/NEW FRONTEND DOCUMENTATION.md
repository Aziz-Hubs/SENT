# SENT Frontend Documentation

## Overview
The SENT frontend is a monorepo built with **Next.js 16**, **Turborepo**, and **Tailwind CSS**. It follows a strict modular architecture to separate business logic (MSP, ERP, SEC) from the main application shell.

## Architecture

### Directory Structure
```
frontend/
├── apps/
│   └── sent-platform/      # Main application (Next.js)
│       ├── src/app/        # Routing and Layouts
│       └── src/lib/        # App-specific utilities (minimal)
│
├── packages/
│   ├── platform-ui/        # Shared Design System (ShadCN)
│   ├── feature-sent-msp/   # MSP Domain (Pulse RMM, etc.)
│   ├── feature-sent-erp/   # ERP Domain
│   ├── feature-sent-sec/   # Security Domain
│   ├── feature-sent-core/  # Core Platform Logic (Auth, Settings)
│   └── shared/             # (Optional) Common non-UI utilities
│
└── docs/                   # Documentation
```

### Key Principles
1.  **Modular Features**: Business logic lives in `packages/feature-*`. The main app (`apps/sent-platform`) should primarily compose these features into pages.
2.  **Shared UI**: All reusable UI components (Buttons, Cards, Inputs) reside in `@sent/platform-ui`.
3.  **Strict Boundaries**: Features should not import from other features if possible. They should interact via the Core platform or defined interfaces.

## Development

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Commands
| Command | Description |
| :--- | :--- |
| `pnpm install` | Install dependencies for all workspaces. |
| `pnpm run dev` | Start the development server (localhost:3000). |
| `pnpm run build` | Build all apps and packages. |
| `pnpm run lint` | Run code quality checks. |
| `pnpm run clean` | Clean `node_modules` and `.next` caches. |

### Adding a New Feature
1.  Identify the domain (MSP, ERP, SEC).
2.  Create your components/logic in `packages/feature-sent-[domain]/src`.
3.  Export public components from `packages/feature-sent-[domain]/src/index.ts`.
4.  Import in the main app: `import { MyFeature } from "@sent/feature-sent-[domain]";`

### Shared Components
To add a new UI component:
1.  Add it to `packages/platform-ui/src/components/ui`.
2.  Export it from `packages/platform-ui/src/index.ts`.

## Deployment
The application is deployed as a single Next.js app (`apps/sent-platform`). The build process automatically bundles the referenced packages.

## Troubleshooting
- **Module not found**: Ensure you have exported the component from the package's `index.ts`.
- **Type errors**: Run `pnpm run type-check` to identify issues across the monorepo.
- **pnpm issues**: If `pnpm` fails, ensure you have the correct version `corepack enable && corepack prepare pnpm@9.15.0 --activate`.
