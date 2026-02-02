# Project Structure Map (Web Edition)

```mermaid
graph TD
    Root[SENT Project Root] --> Backend[backend]
    Root --> Frontend[frontend]
    Root --> Docs[Docs]

    Backend --> Main[main.go]
    Backend --> Internal[internal]
    Backend --> Docker[docker]

    Internal --> App[app]
    Internal --> Platform[platform]
    Internal --> Divisions[divisions]
    Internal --> DB[db]
    
    App --> RPC[rpc]
    App --> Bridge[bridge]

    Frontend --> AppDir[app]
    Frontend --> Components[src/components]
    Frontend --> Lib[src/lib]
    
    AppDir --> ERPRoutes[erp]
    AppDir --> MSPRoutes[msp]
```

## Directory Description

- **backend/**: Pure Go API Server.
    - **internal/**:
        - **app/bridge/**: Domain bridges (Logic Layer).
        - **app/rpc/**: Universal JSON-RPC Dispatcher.
        - **divisions/**: ERP/MSP/SEC domain logic.
        - **db/**: Generated SQLc code.

- **frontend/**: Next.js 15 Application.
    - **src/app/**: App Router routes and pages.
    - **src/components/**: ShadCN/UI components.
    - **src/lib/**: Shared utilities and API client.

- **Docs/**: Project documentation.
