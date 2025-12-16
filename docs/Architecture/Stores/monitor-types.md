---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Monitor types store"
summary: "Reference for the renderer store that caches monitor type configs and formatting helpers."
created: "2025-12-12"
last_reviewed: "2025-12-12"
category: "guide"
author: "Uptime Watcher Team"
tags:
 - stores
 - monitoring
---

# Monitor types store

## Purpose

`useMonitorTypesStore` caches monitor type configuration (field definitions,
formatting rules, validation hints). It is a **read-heavy** store:

- it loads the canonical monitor type config array from the backend
- it provides helper actions that call formatting/validation services

## Source

- `src/stores/monitor/useMonitorTypesStore.ts`

## Data flow

- Backend → preload → renderer service:
  - `src/services/MonitorTypesService.ts`
- Renderer service → store:
  - `loadMonitorTypes()` consumes the already-validated service output

## Error handling

All async actions integrate via `createStoreErrorHandler` and write to
`useErrorStore`.

Recommended keys:

- store key: `"monitor-types"`
- operations:
  - `"monitorTypes.loadTypes"`
  - `"monitorTypes.validateMonitorData"`
  - `"monitorTypes.formatMonitorDetail"`

## Testing

- `src/test/stores/monitor/useMonitorTypesStore.*.test.ts`

## Architecture notes

This store implements the "cache + derived helpers" pattern:

- backend owns the canonical monitor-type configuration
- renderer caches the validated config for fast access
- UI and other stores consume the cached config (no ad-hoc re-validation)
