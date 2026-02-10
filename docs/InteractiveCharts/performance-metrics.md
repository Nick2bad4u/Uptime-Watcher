---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Performance Metrics"
summary: "Performance relationships and optimization flows across the app."
created: "2026-02-09"
last_reviewed: "2026-02-09"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "performance"
  - "benchmarks"
  - "mermaid"
slug: "/performance-metrics"
sidebar_label: "📊 Performance Metrics"
---
# Performance Metrics

This page highlights where performance costs show up in Uptime Watcher and which subsystems tend to dominate resource usage.

The intent is to provide a shared vocabulary when discussing bottlenecks (renderer responsiveness vs. IPC overhead vs. database throughput).

## Application Performance Overview

```mermaid
graph TB
  subgraph "Frontend Performance"
    ReactRender[React Rendering]
    StateUpdates[State Updates]
    UIResponsiveness[UI Responsiveness]
    MemoryUsage[Memory Usage]
  end

  subgraph "Backend Performance"
    IPCLatency[IPC Latency]
    DatabaseOps[Database Operations]
    NetworkRequests[Network Requests]
    CPUUtilization[CPU Utilization]
  end

  ReactRender --> UIResponsiveness
  StateUpdates --> ReactRender
  IPCLatency --> StateUpdates

  DatabaseOps --> IPCLatency
  NetworkRequests --> IPCLatency
```

## Notes

- Renderer performance is most sensitive to the _volume and frequency_ of state updates.
- Main-process performance is often dominated by network concurrency and database writes.
