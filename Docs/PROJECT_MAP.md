# Project Structure Map

```mermaid
graph TD
    Root[SENT Project Root] --> Cmd[cmd]
    Root --> Internal[internal]
    Root --> Web[web]

    Root --> Scripts[scripts]
    Root --> Configs[configs]

    Cmd --> CmdSent[sent]
    CmdSent --> Main[main.go]

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

    Web --> Frontend[frontend]
    Web --> Assets[assets.go]
    Frontend --> Src[src]
    Frontend --> Dist[dist]



    Scripts --> Maint[Maintenance Scripts]
```

## Directory Description

- **cmd/sent**: Entry point for the application. Contains `main.go`.
- **internal**: Private application code.
    - **app**: Application-specific logic (e.g., Wails bridge).
    - **platform**: Shared infrastructure (Auth, Database, Orchestrator).
    - **divisions**: Domain logic split into ERP and MSP.
- **web**: Web assets and embedding logic.
    - **frontend**: The Vite/React frontend application.
    - **assets.go**: Go file embedding the `dist` folder.

- **scripts**: Utility and maintenance scripts (`*.ps1`, `*.go`).
