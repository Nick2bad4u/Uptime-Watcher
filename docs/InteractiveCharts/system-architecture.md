---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "System Architecture Overview"
summary: "High-level architecture diagrams and key component interactions."
created: "2026-02-09"
last_reviewed: "2026-02-09"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "electron"
  - "react"
  - "ipc"
  - "mermaid"
slug: /system-architecture
sidebar_label: "🏗️ System Architecture"
---

# System Architecture Overview

This page provides a comprehensive view of the Uptime Watcher system architecture using interactive Mermaid diagrams.

## High-Level System Architecture

```mermaid
graph TB
  %% Main Application Layer
  UI[Frontend UI<br/>React + TypeScript]
  Store[State Management<br/>Zustand Stores]

  %% IPC Communication
  IPC[IPC Bridge<br/>Secure Context Bridge]

  %% Electron Main Process
  Main[Electron Main Process]
  Services[Service Container<br/>Dependency Injection]

  %% Core Services
  Site[Site Manager<br/>Site orchestration]
  Monitor[Monitor Manager<br/>Dynamic Registry:<br/> HTTP • DNS • SSL • Ping • Port • CDN • Replication • Heartbeat • WebSocket]
  Config[Configuration Manager<br/>Settings & Preferences]
  DB[Database Manager<br/>SQLite Operations]

  %% Database & Storage
  SQLite[(SQLite Database<br/>Sites, History, Settings)]

  %% External Systems
  Network[Network Resources<br/>Monitored Sites]

  %% UI Components
  UI --> Store
  Store --> IPC
  IPC --> Main

  %% Main Process Services
  Main --> Services
  Services --> Monitor
  Services --> Site
  Services --> Config
  Services --> DB

  %% Database Operations
  DB --> SQLite

  %% External Monitoring
  Monitor --> Network

  %% Data Flow
  SQLite -.-> Site
  Site -.-> Store
  Monitor -.-> Store

  %% Styling
  classDef frontend fill:#3b82f6,stroke:#1e40af,color:#ffffff
  classDef backend fill:#059669,stroke:#047857,color:#ffffff
  classDef database fill:#dc2626,stroke:#b91c1c,color:#ffffff
  classDef external fill:#7c3aed,stroke:#5b21b6,color:#ffffff
  classDef ipc fill:#ea580c,stroke:#c2410c,color:#ffffff

  class UI,Store frontend
  class Main,Services,Monitor,Site,Config,DB backend
  class SQLite database
  class Network external
  class IPC ipc
```

## Component Interaction Flow

```mermaid
sequenceDiagram
  participant UI as Frontend UI
  participant Store as Zustand Store
  participant IPC as IPC Bridge
  participant MM as Monitor Manager
  participant SM as Site Manager
  participant DB as Database
  participant Net as Network

  Note over UI, Net: Site Monitoring Cycle

  UI->>Store: User adds new site
  Store->>IPC: Create site request
  IPC->>SM: Validate & create site
  SM->>DB: Store site configuration
  DB-->>SM: Confirm storage
  SM-->>Store: Site created successfully
  Store-->>UI: Update site list

  Note over MM, Net: Monitoring Process

  MM->>DB: Get active sites
  DB-->>MM: Return site list
  MM->>Net: Monitor site health
  Net-->>MM: Return health status
  MM->>DB: Store monitoring result
  MM->>Store: Broadcast status update
  Store-->>UI: Update site status

  Note over UI, DB: Data Persistence

  UI->>Store: View site history
  Store->>IPC: Request history data
  IPC->>SM: Get site history
  SM->>DB: Query historical data
  DB-->>SM: Return history records
  SM-->>Store: History data
  Store-->>UI: Display charts
```

## Monitor Type Hierarchy

```mermaid
classDiagram
  class MonitorTypeRegistry {
    +registerMonitorType(config: BaseMonitorConfig): void
    +getMonitorServiceFactory(type: string): () => IMonitorService
    +getAllMonitorTypeConfigs(): BaseMonitorConfig[]
  }

  class BaseMonitorConfig {
    +type: string
    +displayName: string
    +fields: MonitorFieldDefinition[]
    +serviceFactory(): IMonitorService
  }

  class IMonitorService {
    <<interface>>
    +getType(): MonitorType
    +updateConfig(config: Partial<MonitorConfig>): void
    +check(monitor: Monitor, signal?: AbortSignal): Promise<MonitorCheckResult>
  }

  class MonitorManager {
    +performMonitorCheck(monitor: Monitor): Promise<void>
    +executeMonitorCheck(monitor: Monitor): Promise<MonitorCheckResult>
  }

  class HttpMonitor
  class HttpHeaderMonitor
  class HttpKeywordMonitor
  class HttpJsonMonitor
  class HttpStatusMonitor
  class HttpLatencyMonitor
  class PingMonitor
  class PortMonitor
  class DnsMonitor
  class SslMonitor
  class CdnEdgeConsistencyMonitor
  class ReplicationMonitor
  class ServerHeartbeatMonitor
  class WebsocketKeepaliveMonitor

  IMonitorService <|.. HttpMonitor
  IMonitorService <|.. HttpHeaderMonitor
  IMonitorService <|.. HttpKeywordMonitor
  IMonitorService <|.. HttpJsonMonitor
  IMonitorService <|.. HttpStatusMonitor
  IMonitorService <|.. HttpLatencyMonitor
  IMonitorService <|.. PingMonitor
  IMonitorService <|.. PortMonitor
  IMonitorService <|.. DnsMonitor
  IMonitorService <|.. SslMonitor
  IMonitorService <|.. CdnEdgeConsistencyMonitor
  IMonitorService <|.. ReplicationMonitor
  IMonitorService <|.. ServerHeartbeatMonitor
  IMonitorService <|.. WebsocketKeepaliveMonitor

  MonitorTypeRegistry --> BaseMonitorConfig
  MonitorTypeRegistry --> IMonitorService
  MonitorManager --> MonitorTypeRegistry
```

## Site Provisioning Control Plane

```mermaid
flowchart LR
  %% Domains
  subgraph Renderer["Renderer Process"]
    UI[AddSiteForm]
    SitesSvc["SiteService<br/>(waitForElectronBridge)"]
  end

  subgraph Preload["Preload Bridge"]
    SitesAPI[electronAPI.sites.addSite]
  end

  subgraph MainProcess["Electron Main Process"]
    Ipc["IpcService<br/>registerStandardizedIpcHandler"]
    subgraph Managers["ServiceContainer Managers"]
      Orchestrator[UptimeOrchestrator.addSite]
      SiteMgr[SiteManager.addSite]
      MonitorMgr[MonitorManager.setupSiteForMonitoring]
      AppSvc[ApplicationService]
      Notify[NotificationService]
    end
    subgraph Persistence["Persistence & Scheduling"]
      Writer[SiteWriterService.createSite]
      DbTx[DatabaseService.executeTransaction]
      Repos["Site/Monitor Repositories"]
      Scheduler[MonitorScheduler.startSite]
      CheckerStart[EnhancedMonitorChecker.startMonitoring]
    end
  end

  subgraph Events["Cache & Event Bus"]
    SitesCache[StandardizedCache&lt;Site&gt;]
    EventBus[TypedEventBus&lt;UptimeEvents&gt;]
  end

  subgraph FrontendSync["Renderer Sync"]
    RendererBridge[RendererEventBridge.sendToRenderers]
    EventsAPI[electronAPI.events.on...]
    SiteStore[useSiteSync & sites store]
  end

  UI -->|submit site config| SitesSvc
  SitesSvc -->|invoke| SitesAPI
  SitesAPI -->|ipc invoke "add-site"| Ipc
  Ipc --> Orchestrator
  Orchestrator --> SiteMgr
  SiteMgr -->|validate & persist| Writer
  Writer --> DbTx --> Repos --> SiteMgr
  SiteMgr -->|cache set| SitesCache
  SiteMgr -->|emit "site:added"| EventBus
  Orchestrator -->|auto setup| MonitorMgr
  MonitorMgr --> Scheduler --> CheckerStart
  CheckerStart -->|start monitoring events| EventBus
  EventBus --> AppSvc
  AppSvc --> Notify
  AppSvc --> RendererBridge
  SitesCache -->|cache-updated| EventBus
  RendererBridge -->|webContents.send| EventsAPI
  EventsAPI -->|contextBridge dispatch| SiteStore
  SiteStore -->|hydrate state| UI
```

---

For deeper insights into each module, see the API documentation and code references in the repository.
