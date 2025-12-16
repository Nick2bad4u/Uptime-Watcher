---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Uptime Watcher Architecture Diagram"
summary: "High-level architecture diagram showing data flow between frontend, preload bridge, IPC service, orchestrator, managers, repositories, and database."
created: "2025-10-15"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "diagram"
 - "overview"
---

# Uptime Watcher Architecture Diagram

## Complete Data Flow Visualization

```mermaid
graph TB
    subgraph Frontend["FRONTEND (Renderer Process)"]
        ReactComponents["React<br/>Components"]
        ZustandStores["Zustand<br/>Stores"]
        FrontendServices["Services<br/>(Thin)"]

        ReactComponents -->|reads state| ZustandStores
        ZustandStores -->|calls| FrontendServices
        ReactComponents -->|dispatches actions| ZustandStores

        FrontendServices -->|invokes| ContextBridge["Renderer Services<br/>(wrap window.electronAPI)"]
    end

    ContextBridge -.->|"IPC BOUNDARY"| IPCService

    subgraph Backend["BACKEND (Main Process)"]
        subgraph IPC["IPC Service"]
            IPCHandlers["Channel Handlers<br/>(Typed & Validated)<br/>- sites: add-site, get-sites, update-site<br/>- monitoring: start-monitoring, check-site-now<br/>- data: export-data, import-data"]
        end

        IPCHandlers --> Orchestrator["UptimeOrchestrator<br/>- Coordinates between managers<br/>- High-level error context<br/>- Event bus listener/emitter"]

        Orchestrator --> SiteManager["SiteManager<br/>- Business Logic<br/>- Validation"]
        Orchestrator --> MonitorManager["MonitorManager<br/>- Monitoring Lifecycle<br/>- Status"]
        Orchestrator --> DBManager["DBManager<br/>- Data Ops<br/>- Import<br/>- Export"]

        SiteManager --> ServiceContainer["Service Container<br/>- Dependency Injection<br/>- Shared service instances"]
        MonitorManager --> ServiceContainer
        DBManager --> ServiceContainer

        ServiceContainer --> SiteRepo["SiteRepository<br/>┌─────────────┐<br/>│ Transaction │<br/>│   Adapters  │<br/>└─────────────┘"]
        ServiceContainer --> MonitorRepo["MonitorRepo"]
        ServiceContainer --> HistoryRepo["HistoryRepo"]

        SiteRepo --> DatabaseService["DatabaseService<br/>- executeTransaction()<br/>- Connection mgmt"]
        MonitorRepo --> DatabaseService
        HistoryRepo --> DatabaseService
    end

    DatabaseService --> SQLite[("SQLite Database<br/>(node-sqlite3-wasm)")]

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style IPC fill:#f0f0f0
    style ContextBridge fill:#ffcccc
    style SQLite fill:#d4edda
```

## Event Bus Flow

```mermaid
graph TB
    EventBus["TypedEventBus<br/>- Type-safe events<br/>- Middleware chain<br/>- Correlation IDs"]

    EventBus --> MonitorStatus["Monitor Status<br/>Updates"]
    EventBus --> SystemEvents["System<br/>Events"]
    EventBus --> SiteChanges["Site<br/>Changes"]

    MonitorStatus --> Orchestrator["UptimeOrchestrator<br/>(Forwards to IPC)"]
    SystemEvents --> Orchestrator
    SiteChanges --> Orchestrator

    Orchestrator --> WebContents["window.webContents.send()"]
    WebContents --> RendererListeners["Renderer<br/>Listeners"]

    style EventBus fill:#e8f4f8
    style Orchestrator fill:#fff4e1
    style RendererListeners fill:#e1f5ff
```

## Validation Layers

```mermaid
graph TB
    IPCValidators["Layer 1: IPC Validators<br/>────────────────────────<br/>Purpose: Schema/shape validation<br/>Example: Check arg count, basic types<br/><br/>if (!Array.isArray(args) ‖ args.length === 0) {<br/>    throw new ValidationError('Missing parameter');<br/>}"]

    ManagerValidators["Layer 2: Manager Validators<br/>─────────────────────────<br/>Purpose: Business logic validation<br/>Example: Domain rules, uniqueness<br/><br/>if (!site.name?.trim()) {<br/>    throw new Error('Site name required');<br/>}<br/>if (site.name.length > 255) {<br/>    throw new Error('Name too long');<br/>}"]

    DBValidators["Layer 3: Repository/Database<br/>──────────────────────────<br/>Purpose: Data integrity (SQLite constraints)<br/>Example: Foreign keys, unique constraints<br/><br/>FOREIGN KEY (site_identifier) REFERENCES sites(identifier)<br/>UNIQUE INDEX idx_sites_identifier ON sites(identifier)"]

    IPCValidators --> ManagerValidators
    ManagerValidators --> DBValidators

    style IPCValidators fill:#ffe6e6
    style ManagerValidators fill:#fff8e6
    style DBValidators fill:#e6f7e6
```

## Error Propagation Flow

```mermaid
graph TB
    Repository["Repository Layer<br/>└─► withDatabaseOperation()<br/>    └─► Catches DB errors, logs, re-throws"]

    Manager["Manager Layer<br/>└─► Direct propagation (no try/catch)<br/>    └─► Let repository errors bubble up"]

    Orchestrator["Orchestrator Layer<br/>└─► try/catch for high-level context<br/>    └─► Add business context, re-throw"]

    IPCHandler["IPC Handler<br/>└─► registerStandardizedIpcHandler()<br/>    └─► Converts errors to { success: false, error }"]

    PreloadBridge["Preload Bridge<br/>└─► validateIpcResponse()<br/>    └─► Throws if response.success === false"]

    FrontendService["Frontend Service<br/>└─► Direct throw (let caller handle)"]

    ZustandStore["Zustand Store<br/>└─► withErrorHandling() + createStoreErrorHandler()<br/>    └─► Logs to error store, shows UI notification"]

    Repository --> Manager
    Manager --> Orchestrator
    Orchestrator --> IPCHandler
    IPCHandler --> PreloadBridge
    PreloadBridge --> FrontendService
    FrontendService --> ZustandStore

    style Repository fill:#d4edda
    style Manager fill:#cfe2ff
    style Orchestrator fill:#fff3cd
    style IPCHandler fill:#f8d7da
    style PreloadBridge fill:#e7e7e7
    style FrontendService fill:#d1ecf1
    style ZustandStore fill:#d4edda
```

## Key Architectural Patterns

```mermaid
mindmap
  root((Architectural<br/>Patterns))
    Repository Pattern
      All DB access through repositories
      Transaction adapters for batch ops
      Internal/public method separation
    Dependency Injection
      Services receive dependencies in constructor
      No global state access
      Testable, mockable boundaries
    Type-Safe IPC
      Centralized channel definitions
      Auto-generated typed invokers
      Runtime handler verification
    Event-Driven Architecture
      TypedEventBus for main process
      Middleware for cross-cutting concerns
      Correlation IDs for tracing
    Modular State Management
      Domain-specific Zustand stores
      Composition over monoliths
      Clear action boundaries
    Layered Validation
      IPC: Schema validation
      Manager: Business validation
      DB: Integrity constraints
```

## Notes

1. **IPC Boundary** is the security barrier between renderer (untrusted) and main (trusted)
2. **Event Bus** enables loose coupling between components
3. **Transaction Adapters** allow batch operations without breaking encapsulation
4. **Validation Layers** ensure data quality at appropriate boundaries
5. **Error Propagation** follows a consistent path with context added at orchestrator level
6. **Service Container** provides dependency injection for all backend services
7. **Repositories** handle all database operations with transaction support

## Current Implementation Audit (2025-11-04)

- Validated the backend orchestration flow against `electron/UptimeOrchestrator.ts` and `electron/managers/*` to ensure the diagram still reflects the coordination between orchestrator, managers, and repositories.
- Checked `electron/services/ipc/IpcService.ts` and preload bridges under `electron/preload/domains/` to confirm the IPC boundary annotations remain accurate.
- Reviewed renderer wiring in `src/stores` and `src/services` to verify the state/action pathways shown in the diagram continue to mirror production code.
