# Project Structure Map

```mermaid
graph TD
    Root[SENT Project Root] --> Backend[backend]
    Root --> Frontend[frontend]
    Root --> Docs[Docs]

    Backend --> Main[main.go]
    Backend --> Internal[internal]
    Backend --> WailsConfig[wails.json]
    Backend --> BackendBuild[build]

    Internal --> App[app]
    Internal --> Platform[platform]
    Internal --> Divisions[divisions]
    
    Divisions --> ERP[erp]
    Divisions --> MSP[msp]
    
    ERP --> Stock[stock]
    ERP --> People[people]
    ERP --> Capital[capital]

    MSP --> Pulse[pulse]
    MSP --> Pilot[pilot]

    Frontend --> Src[src]
    Frontend --> Dist[dist]
    Frontend --> Components[components]
    
    Src --> Pages[pages]
    Src --> Lib[lib]
```

## Directory Description

- **backend/**: The Go application code (Wails).
    - **main.go**: Entry point for the application.
    - **internal/**: Private application code.
        - **app/**: Application-specific logic (e.g., Wails bridge).
        - **platform/**: Shared infrastructure (Auth, Database, Orchestrator).
        - **divisions/**: Domain logic split into ERP and MSP.
    - **wails.json**: Wails project configuration.

- **frontend/**: The Vite/React frontend application.
    - **src/**: Source code.
        - **pages/**: Route components.
        - **lib/**: Shared utilities.
    - **wailsjs/**: Generated Go bindings for TypeScript.

- **Docs/**: Project documentation.
