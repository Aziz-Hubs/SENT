# SENT Project Structure

This document outlines the directory structure and key components of the SENT application.

## High-Level Overview

The repositories follow a monorepo structure utilizing Go workspaces and NPM for frontend dependencies.

```
SENTv2/sent/
├── backend/                # Go backend source code (Wails application)
│   ├── cmd/                # Application entry points
│   ├── internal/           # Private application code
│   │   ├── app/            # App-specific logic and bridge
│   │   ├── divisions/      # Business logic (ERP, MSP, etc.)
│   │   └── platform/       # Core infrastructure (Auth, DB, etc.)
│   ├── storage/            # Database migrations and queries
│   └── web/                # Frontend embedding logic
├── frontend/               # React/TypeScript frontend application
│   ├── src/                # Frontend source code
│   ├── public/             # Static assets
│   └── dist/               # Compiled frontend assets
├── docs/                   # Project documentation and specifications
└── scripts/                # Utility and maintenance scripts
```

## Key Components

### Backend (`backend/`)
- **cmd/**: Contains the main entry point for the application (`main.go`).
- **internal/app/**: Contains the Wails bridge and application lifecycle management.
- **internal/divisions/**: Segregates business logic into major divisions (ERP, MSP).
- **internal/platform/**: Shared services like Authentication (`auth`), Database (`database`), and Observability.
- **storage/**: SQL migrations and generated SQLc code for database access.

### Frontend (`frontend/`)
- Built with React, Vite, and TypeScript.
- **src/components/**: Reusable UI components.
- **src/pages/**: Application pages structured by division and module.
- **src/lib/**: Utility functions and shared stores.

### Documentation (`docs/`)
- Architecture diagrams, specifications, and guides.
- `Master Technical Architecture.md`: Detailed system architecture.
- `Zitadel_Configuration.md`: Authentication setup guide.

### Scripts (`scripts/`)
- PowerShell and Shell scripts for build automation, clean-up, and maintenance.
