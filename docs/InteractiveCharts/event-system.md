---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Event System Architecture"
summary: "Interactive Mermaid diagrams describing the TypedEventBus and event flow across the main/renderer boundary."
created: "2026-02-10"
last_reviewed: "2026-02-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "events"
 - "ipc"
 - "mermaid"
slug: "/event-system"
sidebar_label: "📣 Event System"
---

# Event System Architecture

This page documents the event-driven architecture and `TypedEventBus` that powers real-time communication throughout Uptime Watcher.

## Event System Overview

The following diagram shows the event system architecture:

```mermaid
graph TB
    subgraph Emitters["Event Emitters"]
        MonitorMgr[Monitor Manager]
        SiteMgr[Site Manager]
        ConfigMgr[Configuration Manager]
        UpdateSvc[Update Service]
        NotifySvc[Notification Service]
    end

    subgraph EventBus["TypedEventBus&lt;UptimeEvents&gt;"]
        Registry[Event Registry]
        Handlers[Handler Registry]
        Middleware[Event Middleware]
        Queue[Event Queue]
    end

    subgraph Subscribers["Event Subscribers"]
        AppSvc[Application Service]
        RendererBridge[Renderer Event Bridge]
        TelemetrySvc[Telemetry Service]
        HistorySvc[History Service]
        CacheSvc[Cache Service]
    end

    subgraph Renderers["Renderer Processes"]
        EventsAPI[electronAPI.events]
        Listeners[Event Listeners]
        Stores[Zustand Stores]
        UI[React Components]
    end

    MonitorMgr -->|emit| EventBus
    SiteMgr -->|emit| EventBus
    ConfigMgr -->|emit| EventBus
    UpdateSvc -->|emit| EventBus
    NotifySvc -->|emit| EventBus

    EventBus --> Registry
    Registry --> Handlers
    Handlers --> Middleware
    Middleware --> Queue

    Queue --> AppSvc
    Queue --> RendererBridge
    Queue --> TelemetrySvc
    Queue --> HistorySvc
    Queue --> CacheSvc

    RendererBridge -->|broadcast| EventsAPI
    EventsAPI --> Listeners
    Listeners --> Stores
    Stores --> UI

    classDef emitter fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef bus fill:#059669,stroke:#047857,color:#ffffff
    classDef subscriber fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef renderer fill:#7c3aed,stroke:#5b21b6,color:#ffffff

    class MonitorMgr,SiteMgr,ConfigMgr,UpdateSvc,NotifySvc emitter
    class Registry,Handlers,Middleware,Queue bus
    class AppSvc,RendererBridge,TelemetrySvc,HistorySvc,CacheSvc subscriber
    class EventsAPI,Listeners,Stores,UI renderer
```

## Event Type Hierarchy

Renderer event contracts are defined in `RendererEventPayloadMap` (see `shared/types/events.ts`). This diagram mirrors the current channels and payload groupings.

```mermaid
classDiagram
    class RendererEventPayloadMap {
        <<interface>>
        +"cache:invalidated": CacheInvalidatedEventData
        +"monitor:check-completed": MonitorCheckCompletedEventData
        +"monitor:down": MonitorDownEventData
        +"monitor:status-changed": MonitorStatusChangedEventData
        +"monitor:up": MonitorUpEventData
        +"monitoring:started": MonitoringStartedEventData
        +"monitoring:stopped": MonitoringStoppedEventData
        +"settings:history-limit-updated": HistoryLimitUpdatedEventData
        +"site:added": SiteAddedEventData
        +"site:removed": SiteRemovedEventData
        +"site:updated": SiteUpdatedEventData
        +"state-sync-event": StateSyncEventData
        +"test-event": TestEventData
        +"update-status": UpdateStatusEventData
    }

    class MonitorStatusChangedEventData {
        +siteIdentifier: string
        +monitorId: string
        +status: MonitorStatus
        +responseTime?: number
        +timestamp: number
    }

    class MonitorCheckCompletedEventData {
        +siteIdentifier: string
        +monitorId: string
        +statusUpdate: StatusUpdate
        +timestamp: number
    }

    class SiteAddedEventData {
        +site: Site
        +source: SiteAddedSource
        +timestamp: number
    }

    class SiteUpdatedEventData {
        +previousSite: Site
        +site: Site
        +updatedFields: string[]
        +timestamp: number
    }

    class SiteRemovedEventData {
        +siteIdentifier: string
        +siteName: string
        +cascade: boolean
        +timestamp: number
    }

    class HistoryLimitUpdatedEventData {
        +limit: number
        +previousLimit?: number
        +timestamp: number
    }

    class UpdateStatusEventData {
        +status: UpdateStatus
        +error?: string
        +timestamp: number
    }

    class TypedEventBus~T~ {
        +on(event, handler): Unsubscribe
        +once(event, handler): Unsubscribe
        +emit(event, data): void
        +off(event, handler): void
        +removeAllListeners(event?): void
        +listenerCount(event): number
    }

    RendererEventPayloadMap --> MonitorStatusChangedEventData
    RendererEventPayloadMap --> MonitorCheckCompletedEventData
    RendererEventPayloadMap --> SiteAddedEventData
    RendererEventPayloadMap --> SiteUpdatedEventData
    RendererEventPayloadMap --> SiteRemovedEventData
    RendererEventPayloadMap --> HistoryLimitUpdatedEventData
    RendererEventPayloadMap --> UpdateStatusEventData
    TypedEventBus --> RendererEventPayloadMap
```

## Event Flow Sequence

This sequence diagram shows a complete event flow from emission to UI update:

```mermaid
sequenceDiagram
    autonumber
    participant Monitor as Monitor Check
    participant Checker as EnhancedMonitorChecker
    participant StatusSvc as MonitorStatusUpdateService
    participant Bus as TypedEventBus
    participant AppSvc as ApplicationService
    participant Bridge as RendererEventBridge
    participant Preload as Preload Events API
    participant EventSvc as EventsService
    participant Store as Sites Store
    participant UI as React UI

    Monitor->>Checker: check complete
    Checker->>StatusSvc: updateMonitorStatus(result)
    StatusSvc->>StatusSvc: persist to database
    StatusSvc->>StatusSvc: update cache
    StatusSvc->>Bus: emit("monitor:status-changed", event)

    Note over Bus: TypedEventBus routes event

    Bus->>AppSvc: handler invoked
    AppSvc->>AppSvc: process event
    AppSvc->>Bridge: sendToRenderers(channel, payload)

    alt Monitor Down
        Bus->>AppSvc: emit("monitor:down")
        AppSvc->>AppSvc: trigger notification
    else Monitor Up
        Bus->>AppSvc: emit("monitor:up")
        AppSvc->>AppSvc: clear alert
    end

    Bridge->>Preload: webContents.send("monitor:status-changed")
    Preload->>EventSvc: dispatch event
    EventSvc->>EventSvc: validate payload
    EventSvc->>Store: updateSiteStatus(siteId, status)
    Store->>Store: update state
    Store->>UI: trigger re-render

    Note over UI: UI reflects new status
```

## Event Middleware Pipeline

This diagram shows the event middleware processing pipeline:

```mermaid
flowchart LR
    Emit[Event Emitted] --> Validate[Validation Middleware]
    Validate --> Transform[Transform Middleware]
    Transform --> Log[Logging Middleware]
    Log --> Security[Security Middleware]
    Security --> Rate[Rate Limiting Middleware]
    Rate --> Handler[Event Handler]

    Validate -.->|invalid| Drop[Drop Event]
    Security -.->|unauthorized| Drop
    Rate -.->|throttled| Queue[Queue for Later]

    Handler --> Success[Handler Success]
    Handler -.->|error| ErrorHandler[Error Handler]
    ErrorHandler --> Log

    Success --> Telemetry[Telemetry Middleware]
    Telemetry --> Complete[Event Complete]

    Queue -.->|retry| Emit

    classDef middleware fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef handler fill:#10b981,stroke:#059669,color:#ffffff
    classDef error fill:#ef4444,stroke:#dc2626,color:#ffffff

    class Validate,Transform,Log,Security,Rate,Telemetry middleware
    class Handler,Success,Complete handler
    class Drop,ErrorHandler,Queue error
```

## Event Subscription Patterns

This diagram shows different event subscription patterns:

```mermaid
graph TB
    subgraph OneTime["One-Time Subscription (once)"]
        Once1[Subscribe with once()]
        Once2[Event Fired]
        Once3[Handler Executed]
        Once4[Auto Unsubscribe]
        Once1 --> Once2 --> Once3 --> Once4
    end

    subgraph Persistent["Persistent Subscription (on)"]
        Per1[Subscribe with on()]
        Per2[Event Fired]
        Per3[Handler Executed]
        Per4[Remain Subscribed]
        Per5[Event Fired Again]
        Per1 --> Per2 --> Per3 --> Per4 --> Per5 --> Per3
    end

    subgraph Conditional["Conditional Subscription"]
        Cond1[Subscribe with filter]
        Cond2[Event Fired]
        Cond3{Condition Met?}
        Cond4[Handler Executed]
        Cond5[Event Ignored]
        Cond1 --> Cond2 --> Cond3
        Cond3 -->|Yes| Cond4
        Cond3 -->|No| Cond5
    end

    subgraph Wildcard["Wildcard Subscription"]
        Wild1[Subscribe with pattern]
        Wild2[Multiple Events Match]
        Wild3[Handler for All]
        Wild1 --> Wild2 --> Wild3
    end

    classDef pattern fill:#3b82f6,stroke:#1e40af,color:#ffffff

    class Once1,Once2,Once3,Once4,Per1,Per2,Per3,Per4,Per5,Cond1,Cond2,Cond3,Cond4,Cond5,Wild1,Wild2,Wild3 pattern
```

## Event Broadcasting to Multiple Windows

This diagram shows how events are broadcast to all renderer windows:

```mermaid
graph TB
    subgraph MainProcess["Main Process"]
        EventEmitter[Event Source]
        EventBus[TypedEventBus]
        RendererBridge[RendererEventBridge]
        WindowManager[Window Manager]
    end

    subgraph Windows["Active Windows"]
        MainWin[Main Window\nwebContents]
        SettingsWin[Settings Window\nwebContents]
        DetailsWin[Details Window\nwebContents]
    end

    subgraph Handlers["Window Handlers"]
        MainHandler[Main Handler]
        SettingsHandler[Settings Handler]
        DetailsHandler[Details Handler]
    end

    EventEmitter --> EventBus
    EventBus --> RendererBridge
    RendererBridge --> WindowManager

    WindowManager -->|getAllWindows| MainWin
    WindowManager -->|getAllWindows| SettingsWin
    WindowManager -->|getAllWindows| DetailsWin

    MainWin -->|receive event| MainHandler
    SettingsWin -->|receive event| SettingsHandler
    DetailsWin -->|receive event| DetailsHandler

    MainHandler -.->|update| MainStore[Main Store]
    SettingsHandler -.->|update| SettingsStore[Settings Store]
    DetailsHandler -.->|update| DetailsStore[Details Store]

    classDef main fill:#059669,stroke:#047857,color:#ffffff
    classDef window fill:#3b82f6,stroke:#1e40af,color:#ffffff
    classDef handler fill:#f59e0b,stroke:#d97706,color:#ffffff

    class EventEmitter,EventBus,RendererBridge,WindowManager main
    class MainWin,SettingsWin,DetailsWin window
    class MainHandler,SettingsHandler,DetailsHandler,MainStore,SettingsStore,DetailsStore handler
```

## Event Performance Optimization

This diagram shows event system performance optimizations:

```mermaid
flowchart TB
    Event[Event Emitted] --> Debounce{Should Debounce?}

    Debounce -->|Yes| DebounceLo[Debounce Logic]
    Debounce -->|No| Throttle{Should Throttle?}

    DebounceLo --> CollectEvents[Collect Similar Events]
    CollectEvents --> Batch[Batch Events]
    Batch --> Process[Process Batch]

    Throttle -->|Yes| ThrottleLo[Throttle Logic]
    Throttle -->|No| Priority{Check Priority}

    ThrottleLo --> RateLimit[Rate Limiting]
    RateLimit --> Process

    Priority -->|High| Immediate[Immediate Processing]
    Priority -->|Normal| Queue[Event Queue]
    Priority -->|Low| Background[Background Queue]

    Immediate --> Process
    Queue --> Scheduler[Event Scheduler]
    Background --> Scheduler

    Scheduler --> Process

    Process --> Handlers[Execute Handlers]
    Handlers --> Parallel{Parallel Execution?}

    Parallel -->|Yes| ParallelExec[Execute in Parallel]
    Parallel -->|No| Sequential[Execute Sequentially]

    ParallelExec --> Await[Await All]
    Sequential --> Next[Next Handler]

    Await --> Complete[Complete]
    Next --> Complete

    classDef optimization fill:#10b981,stroke:#059669,color:#ffffff
    classDef decision fill:#f59e0b,stroke:#d97706,color:#ffffff
    classDef execution fill:#3b82f6,stroke:#1e40af,color:#ffffff

    class DebounceLo,CollectEvents,Batch,ThrottleLo,RateLimit,Immediate,Queue,Background,Scheduler,ParallelExec,Sequential optimization
    class Debounce,Throttle,Priority,Parallel decision
    class Process,Handlers,Await,Next,Complete execution
```

## Event Error Handling

This diagram shows how event errors are handled:

```mermaid
sequenceDiagram
    autonumber
    participant Emitter as Event Emitter
    participant Bus as Event Bus
    participant Handler1 as Handler 1
    participant Handler2 as Handler 2
    participant Handler3 as Handler 3
    participant ErrorHandler as Error Handler
    participant Logger as Logger

    Emitter->>Bus: emit event
    Bus->>Handler1: invoke handler 1

    alt Handler 1 Success
        Handler1-->>Bus: success
        Bus->>Handler2: invoke handler 2
    else Handler 1 Error
        Handler1--xBus: throw error
        Bus->>ErrorHandler: handle error
        ErrorHandler->>Logger: log error
        ErrorHandler-->>Bus: continue to next
        Bus->>Handler2: invoke handler 2
    end

    alt Handler 2 Success
        Handler2-->>Bus: success
        Bus->>Handler3: invoke handler 3
    else Handler 2 Error
        Handler2--xBus: throw error
        Bus->>ErrorHandler: handle error
        ErrorHandler->>Logger: log error
        ErrorHandler-->>Bus: continue to next
        Bus->>Handler3: invoke handler 3
    end

    Handler3-->>Bus: success
    Bus-->>Emitter: all handlers complete

    Note over Bus,ErrorHandler: Errors in handlers don't stop other handlers
```

---

The event system provides a robust, typed, and performant event-driven architecture that enables loose coupling and real-time updates across all application components.
