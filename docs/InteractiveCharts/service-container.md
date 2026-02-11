---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Service Container & Dependency Injection"
summary: "Diagrams describing the service container architecture, lifecycle, and dependency resolution patterns."
created: "2026-02-10"
last_reviewed: "2026-02-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "dependency-injection"
 - "electron"
 - "mermaid"
slug: "/service-container"
sidebar_label: "🧩 Service Container"
---

# Service Container & Dependency Injection

This page documents the service container architecture and dependency injection patterns that manage application-wide services and their lifecycles.

## Service Container Architecture

```mermaid
graph TB
    subgraph ServiceContainer["ServiceContainer"]
        Registry[Service Registry]
        Factory[Service Factory]
        Lifecycle[Lifecycle Manager]
        DependencyGraph[Dependency Graph]
    end

    subgraph CoreServices["Core Services"]
        DatabaseSvc[Database Service]
        ConfigSvc[Configuration Service]
        LoggerSvc[Logger Service]
        EventBusSvc[Event Bus Service]
    end

    subgraph DomainServices["Domain Services"]
        SiteMgr[Site Manager]
        MonitorMgr[Monitor Manager]
        HistoryMgr[History Manager]
        NotificationMgr[Notification Manager]
    end

    subgraph InfraServices["Infrastructure Services"]
        IPCSvc[IPC Service]
        WindowSvc[Window Service]
        UpdateSvc[Update Service]
        TelemetrySvc[Telemetry Service]
    end

    subgraph ApplicationServices["Application Services"]
        AppSvc[Application Service]
        Orchestrator[Uptime Orchestrator]
    end

    Registry --> Factory
    Factory --> Lifecycle
    Lifecycle --> DependencyGraph

    DependencyGraph --> CoreServices
    CoreServices --> DomainServices
    DomainServices --> InfraServices
    InfraServices --> ApplicationServices

    DatabaseSvc -.->|injected into| SiteMgr
    ConfigSvc -.->|injected into| MonitorMgr
    LoggerSvc -.->|injected into| AppSvc
    EventBusSvc -.->|injected into| Orchestrator

    classDef container fill:#059669,stroke:#047857,color:#ffffff
    classDef core fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef domain fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef infra fill:#8b5cf6,stroke:#7c3aed,color:#ffffff
    classDef app fill:#ef4444,stroke:#dc2626,color:#ffffff

    class Registry,Factory,Lifecycle,DependencyGraph container
    class DatabaseSvc,ConfigSvc,LoggerSvc,EventBusSvc core
    class SiteMgr,MonitorMgr,HistoryMgr,NotificationMgr domain
    class IPCSvc,WindowSvc,UpdateSvc,TelemetrySvc infra
    class AppSvc,Orchestrator app
```

## Service Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Registered : Register Service

    Registered --> Resolving : First Request
    Resolving --> ResolvingDeps : Resolve Dependencies
    ResolvingDeps --> Instantiating : Dependencies Ready
    Instantiating --> Initializing : Instance Created

    Initializing --> Ready : Initialization Complete
    Ready --> Active : Service Activated

    Active --> Active : Handle Requests
    Active --> Suspending : Suspend Request
    Suspending --> Suspended : Suspend Complete

    Suspended --> Resuming : Resume Request
    Resuming --> Active : Resume Complete

    Active --> Disposing : Dispose Request
    Suspended --> Disposing : Dispose Request

    Disposing --> Disposed : Cleanup Complete
    Disposed --> [*]

    ResolvingDeps --> Error : Dependency Error
    Instantiating --> Error : Instantiation Error
    Initializing --> Error : Initialization Error

    Error --> [*] : Fatal Error
```

## Dependency Resolution

```mermaid
flowchart TD
    Request[Service Requested] --> Check{Service Cached?}

    Check -->|Yes| Return[Return Cached Instance]
    Check -->|No| Resolve[Resolve Dependencies]

    Resolve --> GetDeps[Get Dependency List]
    GetDeps --> DepLoop{More Dependencies?}

    DepLoop -->|Yes| CheckDep{Dependency Cached?}
    DepLoop -->|No| AllDepsResolved[All Dependencies Resolved]

    CheckDep -->|Yes| AddCached[Add Cached Dependency]
    CheckDep -->|No| ResolveDep[Resolve Dependency]

    ResolveDep --> CheckCircular{Circular Dependency?}
    CheckCircular -->|Yes| CircularError[Throw Circular Dependency Error]
    CheckCircular -->|No| RecursiveResolve[Recursive Resolution]

    RecursiveResolve --> AddCached
    AddCached --> DepLoop

    AllDepsResolved --> Instantiate[Instantiate Service]
    Instantiate --> Initialize[Initialize Service]
    Initialize --> Cache[Cache Instance]
    Cache --> Return

    CircularError --> End[End with Error]
    Return --> End[End]

    classDef process fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef decision fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef error fill:#ef4444,stroke:#dc2626,color:#ffffff

    class Request,Resolve,GetDeps,AddCached,ResolveDep,RecursiveResolve,AllDepsResolved,Instantiate,Initialize,Cache,Return process
    class Check,DepLoop,CheckDep,CheckCircular decision
    class CircularError error
```

## Service Registration Patterns

```mermaid
classDiagram
    class ServiceContainer {
        +registerSingleton(token, factory)
        +registerTransient(token, factory)
        +registerScoped(token, factory)
        +registerInstance(token, instance)
        +resolve(token): Service
        +dispose(): Promise~void~
    }

    class SingletonService {
        <<pattern>>
        Created once
        Shared across app
        Lives until disposal
    }

    class TransientService {
        <<pattern>>
        Created per request
        Not cached
        Short-lived
    }

    class ScopedService {
        <<pattern>>
        Created per scope
        Shared in scope
        Disposed with scope
    }

    class InstanceService {
        <<pattern>>
        Pre-created instance
        Externally managed
        Container doesn't dispose
    }

    ServiceContainer --> SingletonService
    ServiceContainer --> TransientService
    ServiceContainer --> ScopedService
    ServiceContainer --> InstanceService

    class DatabaseService {
        <<singleton>>
        +query()
        +transaction()
    }

    class Logger {
        <<singleton>>
        +log()
        +error()
    }

    class MonitorChecker {
        <<transient>>
        +check()
        +abort()
    }

    class RequestScope {
        <<scoped>>
        +services: Map
        +dispose()
    }

    SingletonService --|> DatabaseService
    SingletonService --|> Logger
    TransientService --|> MonitorChecker
    ScopedService --|> RequestScope
```

## Dependency Injection Example

```mermaid
sequenceDiagram
    autonumber
    participant App as Application
    participant Container as ServiceContainer
    participant Factory as Service Factory
    participant SiteMgr as SiteManager (requesting)
    participant DbSvc as DatabaseService (dependency)
    participant EventBus as EventBus (dependency)
    participant Cache as CacheService (dependency)

    App->>Container: resolve(SiteManager)
    Container->>Container: check cache
    Note over Container: SiteManager not cached

    Container->>Factory: get dependencies for SiteManager
    Factory-->>Container: [DatabaseService, EventBus, CacheService]

    Container->>Container: resolve(DatabaseService)
    Note over Container: DatabaseService cached
    Container->>Container: resolve(EventBus)
    Note over Container: EventBus cached
    Container->>Container: resolve(CacheService)
    Note over Container: CacheService not cached

    Container->>Factory: create CacheService
    Factory->>Cache: new CacheService()
    Cache-->>Factory: instance
    Factory-->>Container: instance
    Container->>Cache: initialize()
    Cache-->>Container: initialized
    Container->>Container: cache instance

    Container->>Factory: create SiteManager(db, events, cache)
    Factory->>SiteMgr: new SiteManager(db, events, cache)
    SiteMgr-->>Factory: instance
    Factory-->>Container: instance
    Container->>SiteMgr: initialize()
    SiteMgr-->>Container: initialized
    Container->>Container: cache instance

    Container-->>App: SiteManager instance
```

## Service Graph Visualization

```mermaid
graph LR
    subgraph Foundation["Foundation Layer"]
        Logger[Logger Service]
        Config[Configuration Service]
        Events[Event Bus Service]
    end

    subgraph Data["Data Layer"]
        DB[Database Service]
        Cache[Cache Service]
        Repo[Repository Services]
    end

    subgraph Domain["Domain Layer"]
        SiteMgr[Site Manager]
        MonitorMgr[Monitor Manager]
        HistoryMgr[History Manager]
        StatusSvc[Status Update Service]
    end

    subgraph Application["Application Layer"]
        Orchestrator[Uptime Orchestrator]
        AppSvc[Application Service]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        IPC[IPC Service]
        Window[Window Service]
        Notify[Notification Service]
        Update[Update Service]
    end

    Logger --> DB
    Logger --> SiteMgr
    Logger --> MonitorMgr
    Logger --> Orchestrator

    Config --> DB
    Config --> SiteMgr
    Config --> MonitorMgr

    Events --> SiteMgr
    Events --> MonitorMgr
    Events --> AppSvc
    Events --> Orchestrator

    DB --> Repo
    Repo --> SiteMgr
    Repo --> MonitorMgr
    Repo --> HistoryMgr

    Cache --> SiteMgr
    Cache --> MonitorMgr

    SiteMgr --> Orchestrator
    MonitorMgr --> Orchestrator
    HistoryMgr --> StatusSvc
    StatusSvc --> MonitorMgr

    Orchestrator --> AppSvc
    AppSvc --> IPC
    AppSvc --> Notify

    IPC --> Window
    Update --> Window
    Notify --> Window

    classDef foundation fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef data fill:#10b981,stroke:#059669,color:#ffffff
    classDef domain fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef app fill:#ef4444,stroke:#dc2626,color:#ffffff
    classDef infra fill:#8b5cf6,stroke:#7c3aed,color:#ffffff

    class Logger,Config,Events foundation
    class DB,Cache,Repo data
    class SiteMgr,MonitorMgr,HistoryMgr,StatusSvc domain
    class Orchestrator,AppSvc app
    class IPC,Window,Notify,Update infra
```

## Service Disposal Chain

```mermaid
flowchart TD
    Shutdown[Application Shutdown] --> Container[ServiceContainer.dispose]

    Container --> TopologicalSort[Topological Sort\nby Dependencies]
    TopologicalSort --> ReverseOrder[Reverse Dependency Order]

    ReverseOrder --> Loop{More Services?}

    Loop -->|Yes| GetService[Get Next Service]
    Loop -->|No| Complete[Disposal Complete]

    GetService --> CheckDisposable{Has dispose()?}

    CheckDisposable -->|Yes| CallDispose[Call service.dispose]
    CheckDisposable -->|No| RemoveRef[Remove Reference]

    CallDispose --> Await[Await Disposal]
    Await --> CheckError{Error?}

    CheckError -->|Yes| LogError[Log Error]
    CheckError -->|No| RemoveRef

    LogError --> RemoveRef
    RemoveRef --> Loop

    Complete --> ClearCache[Clear Service Cache]
    ClearCache --> ClearRegistry[Clear Registry]
    ClearRegistry --> End[End]

    classDef process fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef decision fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef complete fill:#10b981,stroke:#059669,color:#ffffff

    class Shutdown,Container,TopologicalSort,ReverseOrder,GetService,CallDispose,Await,RemoveRef,ClearCache,ClearRegistry process
    class Loop,CheckDisposable,CheckError decision
    class Complete,End complete
    class LogError error
```
