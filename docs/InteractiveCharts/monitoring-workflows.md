---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Monitoring Workflows"
summary: "Monitoring lifecycle, decision trees, and data synchronization flows."
created: "2026-02-09"
last_reviewed: "2026-02-09"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "monitoring"
 - "workflows"
 - "mermaid"
slug: "/monitoring-workflows"
sidebar_label: "🔄 Monitoring Workflows"
---

# Monitoring Workflows

This page focuses on the monitoring lifecycle and the cross-process synchronization model.

It’s intentionally high-level: the goal is to document **how the system behaves** rather than every internal function call.

## Site Monitoring Lifecycle

```mermaid
flowchart TD
  Start([User Wants to Monitor Site]) --> Input[Enter Site Details]
  Input --> Validate{Validate Input}
  Validate -->|Invalid| Error[Show Error Message]
  Error --> Input
  Validate -->|Valid| Create[Create Site Record]
  Create --> Configure[Configure Monitor Settings]
  Configure --> Schedule[Schedule Monitoring]

  Schedule --> Monitor{Monitor Site}
  Monitor -->|Success| LogSuccess[Log Success Result]
  Monitor -->|Failure| LogFailure[Log Failure Result]
  Monitor -->|Timeout| LogTimeout[Log Timeout Result]

  LogSuccess --> Store[Store in Database]
  LogFailure --> Store
  LogTimeout --> Store

  Store --> Notify{Send Notifications?}
  Notify -->|Yes| SendNotification[Send Alert/Email]
  Notify -->|No| Wait[Wait for Next Interval]
  SendNotification --> Wait

  Wait --> Check{Site Still Active?}
  Check -->|Yes| Monitor
  Check -->|No| Cleanup[Cleanup Resources]
  Cleanup --> End([Monitoring Stopped])
```

## Data Flow and Synchronization Strategy

```mermaid
graph TB
  subgraph Renderer
    UI[User Interface]
    Store[Zustand Sites Store]
    Services["Renderer Services<br/>(StateSyncService, MonitoringService)"]
  end

  subgraph Preload
    Bridge[Context Bridge]
    Guards[Runtime Payload Guards]
  end

  subgraph Electron
    Orchestrator[UptimeOrchestrator]
    SiteMgr[SiteManager + StandardizedCache]
    MonitorMgr[MonitorManager]
    EventBus[TypedEventBus&lt;UptimeEvents&gt;]
    Database[(SQLite Database)]
  end

  subgraph External
    Targets[Monitored Targets]
  end

  UI --> Store
  Store --> Services
  Services --> Bridge
  Bridge --> Guards
  Guards --> Orchestrator

  Services -->|Full Sync & Commands| Orchestrator
  Orchestrator --> SiteMgr
  SiteMgr --> Database
  SiteMgr --> EventBus

  EventBus --> Bridge
  Bridge --> Store

  MonitorMgr --> SiteMgr
  MonitorMgr --> EventBus
  MonitorMgr --> Targets
```
