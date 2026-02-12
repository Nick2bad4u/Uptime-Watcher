---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-007: Service Container and Dependency Injection Pattern"
summary: "Establishes a centralized dependency injection container for managing service lifecycles, initialization order, and inter-service communication in the Electron main process."
created: "2025-11-25"
last_reviewed: "2026-02-11"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "dependency-injection"
 - "service-container"
 - "electron"
---

# ADR-007: Service Container and Dependency Injection Pattern

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision](#decision)
4. [Service Categories](#service-categories)
5. [Initialization Sequence](#initialization-sequence)
6. [Event Forwarding Architecture](#event-forwarding-architecture)
7. [Consequences](#consequences)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Testing Considerations](#testing-considerations)
10. [Compliance](#compliance)
11. [Related ADRs](#related-adrs)

## Status

**Accepted** - Core bootstrap pattern for all Electron main process services

## Context

The Electron main process requires coordination of multiple interdependent services including:

- Database services and repositories
- Domain managers (Site, Monitor, Database)
- IPC communication handlers
- Event buses for inter-component communication
- Utility services (Window, Notifications, Auto-updater)

Without centralized dependency management, the application would face:

- **Initialization order issues**: Services depending on uninitialized dependencies
- **Circular dependency risks**: Managers requiring each other during construction
- **Singleton management complexity**: Multiple instances of services that should be singletons
- **Testing difficulties**: Hard-coded dependencies preventing mocking and isolation
- **Event bus fragmentation**: Multiple disconnected event buses without coordination

## Decision

We will implement a **centralized Service Container** pattern using lazy initialization and singleton management for all Electron main process services.

This container is the Electron main-process **composition root** (a.k.a. assembly root): it wires object graphs and owns initialization order.

### Non-goal: general-purpose Service Locator

The `ServiceContainer` is intentionally a singleton, but it must **not** become a globally reachable dependency resolver.

- ✅ **Allowed**: bootstrap and application-lifecycle modules (for example `electron/main.ts`, `electron/services/application/ApplicationService.ts`) obtain the container and request top-level services.
- ✅ **Allowed**: tests that specifically verify container wiring may call `ServiceContainer.getInstance()`.
- ❌ **Disallowed**: domain managers, repositories, monitor services, and utilities importing `ServiceContainer` to "grab" dependencies at call sites.

If a component needs a dependency, it should receive it explicitly (constructor injection) and remain constructible in isolation.

### Lifecycle model (current implementation)

The current container implementation provides **process-lifetime singletons** with lazy instantiation:

- Services are cached in private fields and created on first getter access.
- `initialize()` is **idempotent** and safe to call multiple times; it reuses an internal initialization promise.
- No scoped request/container-per-operation lifecycle exists in production code.

Some dependencies are intentionally transient and created outside the container (for example per-monitor check execution objects); those should remain **factory-created** so they do not accumulate global state.

### Service Container Architecture Overview

```mermaid
graph TB
    subgraph "Service Container (Singleton)"
        SC["ServiceContainer.getInstance()"]

        subgraph "Core Services"
            DB["DatabaseService"]
            Config["ConfigurationManager"]
        end

        subgraph "Repositories"
            SiteRepo["SiteRepository"]
            MonitorRepo["MonitorRepository"]
            HistoryRepo["HistoryRepository"]
            SettingsRepo["SettingsRepository"]
        end

        subgraph "Domain Managers"
            DBMgr["DatabaseManager"]
            SiteMgr["SiteManager"]
            MonitorMgr["MonitorManager"]
        end

        subgraph "Application Services"
            Orchestrator["UptimeOrchestrator"]
            IPC["IpcService"]
        end

        subgraph "Feature Services"
            Notify["NotificationService"]
            Window["WindowService"]
            Updater["AutoUpdaterService"]
            EventBridge["RendererEventBridge"]
        end
    end

    SC --> DB
    SC --> Config
    SC --> SiteRepo
    SC --> MonitorRepo
    SC --> HistoryRepo
    SC --> SettingsRepo
    SC --> DBMgr
    SC --> SiteMgr
    SC --> MonitorMgr
    SC --> Orchestrator
    SC --> IPC
    SC --> Notify
    SC --> Window
    SC --> Updater
    SC --> EventBridge

    DB --> SiteRepo
    DB --> MonitorRepo
    DB --> HistoryRepo
    DB --> SettingsRepo

    SiteRepo --> DBMgr
    MonitorRepo --> DBMgr
    HistoryRepo --> DBMgr
    SettingsRepo --> DBMgr
    Config --> DBMgr

    DBMgr --> SiteMgr
    SiteMgr --> Orchestrator
    MonitorMgr --> Orchestrator
    DBMgr --> Orchestrator

    Orchestrator --> IPC
    Updater --> IPC
    Notify --> IPC

    classDef core fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef repo fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef manager fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef app fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8
    classDef feature fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    classDef container fill:#0f172a,stroke:#0f172a,stroke-width:3px,color:#f8fafc

    class SC container
    class DB,Config core
    class SiteRepo,MonitorRepo,HistoryRepo,SettingsRepo repo
    class DBMgr,SiteMgr,MonitorMgr manager
    class Orchestrator,IPC app
    class Notify,Window,Updater,EventBridge feature
```

### 1. Singleton Container Pattern

```typescript
export class ServiceContainer {
 private static instance: ServiceContainer | undefined;

 public static getInstance(config?: ServiceContainerConfig): ServiceContainer {
  ServiceContainer.instance ??= new ServiceContainer(config ?? {});
  return ServiceContainer.instance;
 }

 public static getExistingInstance(): ServiceContainer | undefined {
  return ServiceContainer.instance;
 }

 public static resetForTesting(): void {
  ServiceContainer.instance = undefined;
 }

 private constructor(config: ServiceContainerConfig = {}) {
  this.config = config;
 }
}
```

### 2. Lazy Initialization with Dependency Resolution

Each service is lazily initialized when first requested, with dependencies resolved automatically:

```typescript
public getSiteManager(): SiteManager {
    if (!this.siteManager) {
        // Dependencies are resolved via other getter methods
        const siteEventBus = new TypedEventBus<UptimeEvents>("SiteManagerEventBus");

        this.siteManager = new SiteManager({
            configurationManager: this.getConfigurationManager(),
            databaseService: this.getDatabaseService(),
            eventEmitter: siteEventBus,
            historyRepository: this.getHistoryRepository(),
            monitoringOperations: this.createMonitoringOperations(),
            monitorRepository: this.getMonitorRepository(),
            settingsRepository: this.getSettingsRepository(),
            siteRepository: this.getSiteRepository(),
        });

        // Set up event forwarding to orchestrator
        this.setupEventForwarding(siteEventBus, "SiteManager");
    }
    return this.siteManager;
}
```

### 3. Explicit Initialization Sequence

The `initialize()` method ensures services are created and initialized in the correct order.

It is also **idempotent**: repeated calls reuse the same in-flight promise.

```typescript
public async initialize(): Promise<void> {
    logger.info("[ServiceContainer] Initializing services");

    // Phase 1: Core infrastructure
    this.getDatabaseService().initialize();
    await this.tryInitializeService(this.getConfigurationManager(), "ConfigurationManager");

    // Phase 2: Repositories (depend on DatabaseService)
    this.getHistoryRepository();
    this.getMonitorRepository();
    this.getSettingsRepository();
    this.getSiteRepository();

    // Phase 3: Orchestrator (initializes the managers it coordinates)
    await this.getUptimeOrchestrator().initialize();

    // Phase 4: IPC handlers (expose orchestrator to renderer)
    this.getIpcService().setupHandlers();

    // Phase 5: Background schedulers (depend on IPC readiness)
    await this.tryInitializeService(this.getCloudSyncScheduler(), "CloudSyncScheduler");

    logger.info("[ServiceContainer] All services initialized successfully");
}
```

### 4. Cross-Manager Communication via Operations Interface

To avoid circular dependencies between managers, the container provides operation interfaces:

```typescript
const monitoringOperations: IMonitoringOperations = {
 setHistoryLimit: async (limit: number): Promise<void> => {
  const databaseManager = this.getDatabaseManager();
  await databaseManager.setHistoryLimit(limit);
 },

 setupNewMonitors: async (
  site: Site,
  newMonitorIds: string[]
 ): Promise<void> => {
  const monitorManager = this.getMonitorManager();
  return monitorManager.setupNewMonitors(site, newMonitorIds);
 },

 startMonitoringForSite: async (
  identifier: string,
  monitorId: string
 ): Promise<boolean> => {
  const monitorManager = this.getMonitorManager();
  return monitorManager.startMonitoringForSite(identifier, monitorId);
 },

 stopMonitoringForSite: async (
  identifier: string,
  monitorId: string
 ): Promise<boolean> => {
  const monitorManager = this.getMonitorManager();
  return monitorManager.stopMonitoringForSite(identifier, monitorId);
 },
};
```

## Service Categories

### Service Dependency Hierarchy

```mermaid
flowchart TD
    subgraph "Layer 1: Infrastructure"
        DatabaseService["DatabaseService<br/>(Singleton via getInstance)"]
        ConfigurationManager["ConfigurationManager"]
    end

    subgraph "Layer 2: Data Access"
        SiteRepository["SiteRepository"]
        MonitorRepository["MonitorRepository"]
        HistoryRepository["HistoryRepository"]
        SettingsRepository["SettingsRepository"]
    end

    subgraph "Layer 3: Domain Logic"
        DatabaseManager["DatabaseManager"]
        SiteManager["SiteManager"]
        MonitorManager["MonitorManager"]
    end

    subgraph "Layer 4: Coordination"
        UptimeOrchestrator["UptimeOrchestrator"]
    end

    subgraph "Layer 5: External Integration"
        IpcService["IpcService"]
        NotificationService["NotificationService"]
        WindowService["WindowService"]
        AutoUpdaterService["AutoUpdaterService"]
    end

    DatabaseService --> SiteRepository
    DatabaseService --> MonitorRepository
    DatabaseService --> HistoryRepository
    DatabaseService --> SettingsRepository

    SiteRepository --> DatabaseManager
    MonitorRepository --> DatabaseManager
    HistoryRepository --> DatabaseManager
    SettingsRepository --> DatabaseManager
    ConfigurationManager --> DatabaseManager

    DatabaseManager --> SiteManager
    DatabaseManager --> MonitorManager

    SiteManager --> UptimeOrchestrator
    MonitorManager --> UptimeOrchestrator
    DatabaseManager --> UptimeOrchestrator

    UptimeOrchestrator --> IpcService
    NotificationService --> IpcService
    AutoUpdaterService --> IpcService

    classDef layer1 fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    classDef layer2 fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    classDef layer3 fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef layer4 fill:#f3e8ff,stroke:#9333ea,stroke-width:2px
    classDef layer5 fill:#fee2e2,stroke:#dc2626,stroke-width:2px

    class DatabaseService,ConfigurationManager layer1
    class SiteRepository,MonitorRepository,HistoryRepository,SettingsRepository layer2
    class DatabaseManager,SiteManager,MonitorManager layer3
    class UptimeOrchestrator layer4
    class IpcService,NotificationService,WindowService,AutoUpdaterService layer5
```

### 1. Core Services (Layer 1)

Infrastructure services with no domain dependencies:

| Service                | Responsibility               | Initialization        |
| ---------------------- | ---------------------------- | --------------------- |
| `DatabaseService`      | SQLite connection management | Synchronous singleton |
| `ConfigurationManager` | Application configuration    | Async initialization  |

### 2. Repositories (Layer 2)

Data access layer implementing ADR-001 Repository Pattern:

| Repository           | Domain              | Dependencies    |
| -------------------- | ------------------- | --------------- |
| `SiteRepository`     | Site persistence    | DatabaseService |
| `MonitorRepository`  | Monitor persistence | DatabaseService |
| `HistoryRepository`  | Status history      | DatabaseService |
| `SettingsRepository` | App settings        | DatabaseService |

### 3. Domain Managers (Layer 3)

Business logic coordinators with event bus integration:

| Manager           | Responsibility                 | Event Bus               |
| ----------------- | ------------------------------ | ----------------------- |
| `DatabaseManager` | Data operations, import/export | DatabaseManagerEventBus |
| `SiteManager`     | Site lifecycle, caching        | SiteManagerEventBus     |
| `MonitorManager`  | Monitoring operations          | MonitorManagerEventBus  |

### 4. Application Services (Layer 4-5)

High-level coordination and external integration:

| Service               | Role                     | Dependencies                         |
| --------------------- | ------------------------ | ------------------------------------ |
| `UptimeOrchestrator`  | Central coordinator      | All managers                         |
| `IpcService`          | Renderer communication   | Orchestrator, Updater, Notifications |
| `NotificationService` | System notifications     | None                                 |
| `WindowService`       | BrowserWindow management | None                                 |
| `AutoUpdaterService`  | App updates              | None                                 |

## Initialization Sequence

### Application Bootstrap Flow

```mermaid
sequenceDiagram
    autonumber
    participant Main as main.ts
    participant AppSvc as ApplicationService
    participant SC as ServiceContainer
    participant DB as DatabaseService
    participant Repos as Repositories
    participant Orch as UptimeOrchestrator
    participant IPC as IpcService
    participant Cloud as CloudSyncScheduler

    Main->>AppSvc: new ApplicationService()
    AppSvc->>SC: getInstance()
    SC-->>AppSvc: ServiceContainer singleton

    Main->>AppSvc: initializeServices()
    AppSvc->>SC: initialize()

    Note over SC,DB: Phase 1: Core Infrastructure
    SC->>DB: getDatabaseService().initialize()
    DB-->>SC: Database ready

    SC->>SC: getConfigurationManager()
    SC->>SC: tryInitializeService(ConfigurationManager)

    Note over SC,Repos: Phase 2: Data Access Layer
    SC->>Repos: getHistoryRepository()
    SC->>Repos: getMonitorRepository()
    SC->>Repos: getSettingsRepository()
    SC->>Repos: getSiteRepository()

    Note over SC,Orch: Phase 3: Coordination Layer
    SC->>Orch: getUptimeOrchestrator().initialize()
    Note over Orch: Orchestrator owns initialization of stateful managers

    Note over SC,IPC: Phase 5: IPC Layer
    SC->>IPC: getIpcService()
    SC->>IPC: setupHandlers()

    Note over SC,Cloud: Phase 6: Background Services
    SC->>Cloud: tryInitializeService(getCloudSyncScheduler())

    SC-->>AppSvc: All services initialized
    AppSvc-->>Main: Ready
```

## Event Forwarding Architecture

The ServiceContainer coordinates event forwarding from manager-specific event buses to the central orchestrator:

### Event Flow Between Managers

```mermaid
flowchart LR
    subgraph "Manager Event Buses"
        SiteEB["SiteManagerEventBus"]
        MonitorEB["MonitorManagerEventBus"]
        DatabaseEB["DatabaseManagerEventBus"]
    end

    subgraph "ServiceContainer"
        Forward["setupEventForwarding()"]
        Strip["stripEventMetadata()"]
    end

    subgraph "Central Coordination"
        Orchestrator["UptimeOrchestrator"]
        RendererBridge["RendererEventBridge"]
    end

    subgraph "Renderer Process"
        Stores["Zustand Stores"]
        UI["React Components"]
    end

    SiteEB -->|"internal:site:*"| Forward
    MonitorEB -->|"monitor:status-changed"| Forward
    DatabaseEB -->|"internal:database:*"| Forward

    Forward --> Strip
    Strip -->|"Sanitized payload"| Orchestrator

    Orchestrator -->|"Public events"| RendererBridge
    RendererBridge -->|"IPC"| Stores
    Stores --> UI

    classDef eventbus fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    classDef container fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef coordination fill:#f3e8ff,stroke:#9333ea,stroke-width:2px
    classDef renderer fill:#dcfce7,stroke:#16a34a,stroke-width:2px

    class SiteEB,MonitorEB,DatabaseEB eventbus
    class Forward,Strip container
    class Orchestrator,RendererBridge coordination
    class Stores,UI renderer
```

### Forwarded Events

The container forwards these events from manager buses to the orchestrator:

```typescript
const eventsToForward = [
 // Monitor events
 "monitor:status-changed",
 "monitor:up",
 "monitor:down",
 "internal:monitor:started",
 "internal:monitor:stopped",
 "internal:monitor:manual-check-completed",
 "internal:monitor:site-setup-completed",

 // Site events
 "internal:site:added",
 "internal:site:removed",
 "internal:site:updated",
 "sites:state-synchronized",

 // Database events
 "internal:database:data-imported",
 "internal:database:history-limit-updated",
 "internal:database:sites-refreshed",
 "internal:database:update-sites-cache-requested",

 // System events
 "system:error",
] as const;
```

### Metadata Stripping

Event payloads are sanitized before forwarding to remove bus-specific metadata:

```typescript
private stripEventMetadata<EventName extends keyof UptimeEvents>(
    eventName: EventName,
    payload: ForwardableEventPayload<EventName>
): UptimeEvents[EventName] {
    // Remove _meta, _originalMeta, and symbol-based metadata
    // Preserve original payload shape for orchestrator consumption
}
```

## Consequences

### Positive

- **Centralized dependency management**: Single source of truth for service instances
- **Correct initialization order**: Explicit sequence prevents dependency issues
- **Singleton guarantees**: Each service instantiated exactly once
- **Event bus coordination**: Manager events flow to central orchestrator
- **Testability**: `resetForTesting()` enables clean test isolation
- **Debug logging**: Optional verbose logging for initialization troubleshooting
- **Introspection**: `getInitializationStatus()` and `getInitializedServices()` for diagnostics

### Negative

- **Single point of failure**: Container issues affect entire application
- **Initialization complexity**: Sequence must be carefully maintained
- **Memory footprint**: All services persist for application lifetime
- **Learning curve**: Developers must understand container patterns
- **Service locator risk**: If imported broadly, the container becomes a Service Locator and degrades testability

### Neutral

- **Lazy initialization**: Services created on first access (not at container creation)
- **No runtime DI framework**: Custom implementation vs. external library

## Implementation Guidelines

### 0. Keep container usage at the composition root

- Prefer passing constructed services into long-lived objects.
- Avoid reaching back into `ServiceContainer` after startup.
- If you need a dependency in a class, add a constructor parameter.

### 1. Adding a New Service

```typescript
// 1. Add private field
private myNewService?: MyNewService;

// 2. Add getter with lazy initialization
public getMyNewService(): MyNewService {
    if (!this.myNewService) {
        this.myNewService = new MyNewService({
            dependency1: this.getDependency1(),
            dependency2: this.getDependency2(),
        });
        if (this.config.enableDebugLogging) {
            logger.debug("[ServiceContainer] Created MyNewService");
        }
    }
    return this.myNewService;
}

// 3. Add to getInitializationStatus()
MyNewService: this.myNewService !== undefined,

// 4. Add to getInitializedServices() serviceMap
MyNewService: this.myNewService,

// 5. If service has initialize(), add to initialize() sequence
await this.tryInitializeService(this.getMyNewService(), "MyNewService");
```

When the new service will be consumed by other services, prefer injecting it via constructors rather than having those consumers call the container.

### 2. Adding Event Bus Forwarding

```typescript
// Create typed event bus for manager
const myManagerEventBus = new TypedEventBus<UptimeEvents>("MyManagerEventBus");

// Set up forwarding after manager creation
this.setupEventForwarding(myManagerEventBus, "MyManager");
```

### 3. Avoiding Circular Dependencies

Use operation interfaces instead of direct manager references:

```typescript
// ❌ Bad - direct circular reference
class SiteManager {
 constructor(private monitorManager: MonitorManager) {}
}

// ✅ Good - operation interface
interface IMonitoringOperations {
 startMonitoringForSite: (
  identifier: string,
  monitorId: string
 ) => Promise<boolean>;
}

class SiteManager {
 constructor(private monitoringOperations: IMonitoringOperations) {}
}
```

## Testing Considerations

### Prefer direct construction for unit tests

For unit tests, prefer constructing the class-under-test directly with fakes/stubs rather than going through `ServiceContainer`.

Use `ServiceContainer.resetForTesting()` when:

- the test is specifically verifying container wiring/initialization, or
- the test is a main-process integration test that relies on the real bootstrap path.

### Test Isolation

```typescript
beforeEach(() => {
 // Reset singleton for clean test state
 ServiceContainer.resetForTesting();
});

afterEach(() => {
 ServiceContainer.resetForTesting();
});
```

### Mocking Dependencies

```typescript
// Create container with test configuration
const container = ServiceContainer.getInstance({
 enableDebugLogging: true,
 notificationConfig: {
  showDownAlerts: false,
  showUpAlerts: false,
 },
});
```

### Verifying Initialization

```typescript
it("should initialize all services in correct order", async () => {
 const container = ServiceContainer.getInstance();
 await container.initialize();

 const status = container.getInitializationStatus();
 expect(status.DatabaseService).toBe(true);
 expect(status.SiteManager).toBe(true);
 expect(status.UptimeOrchestrator).toBe(true);
});
```

## Compliance

All Electron main process services are managed through `ServiceContainer`:

- ✅ `DatabaseService` - Core infrastructure
- ✅ `ConfigurationManager` - Application configuration
- ✅ `SiteRepository`, `MonitorRepository`, `HistoryRepository`, `SettingsRepository` - Data access
- ✅ `DatabaseManager`, `SiteManager`, `MonitorManager` - Domain logic
- ✅ `UptimeOrchestrator` - Central coordination
- ✅ `IpcService` - Renderer communication
- ✅ `NotificationService`, `WindowService`, `AutoUpdaterService` - Feature services
- ✅ `RendererEventBridge` - Event forwarding

### Current Implementation Audit (2026-02-11)

- Verified `electron/services/ServiceContainer.ts` implements a singleton container with lazy getters.
- Confirmed `initialize()` is idempotent and initializes services in this order:
  1. `DatabaseService.initialize()`
  2. `ConfigurationManager.initialize()` (if present)
  3. Repository getters (construction)
  4. `UptimeOrchestrator.initialize()` (managers are initialized by the orchestrator)
  5. `IpcService.setupHandlers()`
  6. `CloudSyncScheduler.initialize()` (best-effort background service)
- Confirmed `ServiceContainer.getExisting()` is used in hot-reload paths to avoid implicit container creation.
- Verified production imports of `ServiceContainer` are constrained to bootstrap/application-lifecycle modules.

## Related ADRs

- [ADR-001: Repository Pattern](./ADR_001_REPOSITORY_PATTERN.md) - Data access layer managed by container
- [ADR-002: Event-Driven Architecture](./ADR_002_EVENT_DRIVEN_ARCHITECTURE.md) - Event buses coordinated by container
- [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md) - IpcService managed by container
