---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Data Models & Database Schema"
summary: "Entity relationship diagram and monitor configuration schema overview."
created: "2026-02-09"
last_reviewed: "2026-02-09"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "sqlite"
  - "database"
  - "schema"
  - "mermaid"
slug: /data-models
sidebar_label: "🗄️ Data Models"
---

# Data Models & Database Schema

These diagrams describe the shape of the local SQLite database and the major relationships between core tables.

The goal is to help contributors understand **where data lives**, **how it relates**, and **which entities are considered authoritative** in the Electron layer.

## Entity Relationship Diagram

```mermaid
erDiagram
  SITES ||--o{ MONITORS : has
  MONITORS ||--o{ HISTORY : records

  SETTINGS ||--|| SITES : controls
  STATS ||--|| SITES : summarizes
  LOGS ||--o{ SITES : references

  SITES {
    string identifier PK
    string name
    boolean monitoring
  }

  MONITORS {
    int id PK
    string site_identifier FK
    string type
    int check_interval_ms
    int timeout_ms
    int retry_attempts
    string status
    int response_time
    string last_error
    string active_operations_json
    int created_at
    int updated_at
  }

  HISTORY {
    int id PK
    int monitor_id FK
    int timestamp
    string status
    int responseTime
    string details
  }

  SETTINGS {
    string key PK
    string value
  }

  STATS {
    string key PK
    string value
  }

  LOGS {
    int id PK
    datetime timestamp
    string level
    string message
    string data
  }

  %% Note: monitor-specific columns may be added over time via schema migrations.
```
