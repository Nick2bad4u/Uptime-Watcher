---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Sites Store and State Sync"
summary: "Overview of the sites store, status update handling, and state synchronization pipeline between Electron main, preload, and the renderer."
created: "2025-12-07"
last_reviewed: "2025-12-11"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "stores"
  - "sites"
  - "state-sync"
  - "architecture"
---

# Sites Store and State Sync

This page provides a focused architecture reference for the renderer sites store
and its interaction with the state synchronization pipeline. It complements the
broader architecture description in
[`docs/Architecture/README.md`](../../Architecture/README.md), which should be
considered the primary system-level reference.

## Key Modules

Renderer and shared modules involved in site state management:

- `src/stores/sites/useSitesStore.ts` – Primary Zustand store for sites,
  exposing selectors and actions for reading and updating the in-memory site
  collection.
- `src/stores/sites/useSiteSync.ts` – Store-side orchestration of state sync
  and cache invalidation behaviour; wires the store to `StateSyncService` and
  the status update handler.
- `src/stores/sites/utils/statusUpdateHandler.ts` – Implements
  `StatusUpdateManager` and `applyStatusUpdateSnapshot`, applying incremental
  status updates from events and manual checks to the sites array.
- `src/services/StateSyncService.ts` – Renderer IPC façade over the
  `stateSync` preload domain, responsible for `getSyncStatus`,
  `requestFullSync`, and `onStateSyncEvent`.
- `shared/types/stateSync.ts` – Canonical contracts for
  `StateSyncStatusSummary`, `StateSyncFullSyncResult`, and related enums.
- `shared/types/events.ts` – Event payload contracts including
  `StateSyncEventData` and `MonitorStatusChangedEventData`.

## State Synchronization Responsibilities

### Main process

- `SiteManager` and `UptimeOrchestrator` maintain the authoritative in-memory
  cache of `Site` entities.
- When bulk or targeted sync operations complete, the orchestrator emits
  `"sites:state-synchronized"` events using the shared
  `StateSyncEventData` contract.
- IPC handlers registered by `electron/services/ipc/IpcService.ts` expose
  `STATE_SYNC_CHANNELS.getSyncStatus` and
  `STATE_SYNC_CHANNELS.requestFullSync` for renderer callers. Both use
  `StateSyncStatusSummary` and `StateSyncFullSyncResult` from
  `@shared/types/stateSync`.

### Preload bridge

- `electron/preload/domains/eventsApi.ts` validates and forwards
  `sites:state-synchronized` events to renderer listeners via the
  `EventsApi` surface.
- `electron/preload/domains/stateSyncApi.ts` (referenced from
  `electron/preload.ts`) exposes the `stateSync` IPC methods and wraps the
  underlying handlers with Zod-based validation.

### Renderer services

- `StateSyncService` is the single entry point for state-sync IPC in the
  renderer:
  - `getSyncStatus()` calls `stateSync.getSyncStatus()` and parses the
    result with `parseStateSyncStatusSummary`.
  - `requestFullSync()` calls `stateSync.requestFullSync()` and parses the
    payload with `parseStateSyncFullSyncResult`.
  - `onStateSyncEvent()` subscribes to incremental state sync events using
    `safeParseStateSyncEventData`, schedules full-sync recovery when
    malformed payloads are observed, and normalizes cleanup handlers
    returned by the preload bridge.

## Sites Store Integration

### Full resynchronization

- `useSiteSync.ts` composes store actions on top of `StateSyncService`:
  - `syncSites()` always performs a backend `requestFullSync()`, derives a
    normalized snapshot for the store, and replaces the local `sites` array
    in a single atomic update.
  - `fullResyncSites()` coalesces concurrent resync requests, delegates to
    `syncSites()`, and logs diagnostic metadata so repeated resyncs can be
    traced.

### Incremental updates

- `StatusUpdateManager` in `statusUpdateHandler.ts` wires renderer events to
  incremental status updates:
  - Subscribes to `monitor:status-changed` and
    `monitor:check-completed` via `EventsService`.
  - Validates incoming payloads with
    `isEnrichedMonitorStatusChangedEventData`.
  - Applies updates using `mergeMonitorStatusChange`, preserving existing
    history arrays when appropriate.
  - Falls back to `fullResyncSites()` when events are malformed or when
    incremental application fails.
- `applyStatusUpdateSnapshot` allows manual checks that return full
  `StatusUpdate` snapshots to be merged into the sites array using the same
  incremental logic as event-driven updates.

## Cache Invalidation and Debounce

- Cache invalidation events propagated from the main process act as coarse
  signals that a refresh is needed (for example after bulk imports or
  settings changes), but they do not themselves carry new site data.
- The sites store uses a short debounce window so multiple invalidations
  result in a single `requestFullSync()` call when possible.
- The **actual** data always flows through the state-sync IPC channels and
  `sites:state-synchronized` events, keeping the main-process cache as the
  source of truth.

## Error Handling and Recovery

- When `StateSyncService.onStateSyncEvent` encounters invalid payloads, it
  logs structured errors and schedules a full sync recovery using
  `requestFullSync()`.
- Recovery emits a synthetic `BULK_SYNC` event that is applied to the sites
  store via the same snapshot utilities, ensuring the renderer converges on
  the backend view even after transient failures.

For a more narrative, end-to-end explanation of this pipeline, see the
"State synchronization pipeline (sites & cache)" section in
[`docs/Architecture/README.md`](../../Architecture/README.md).
