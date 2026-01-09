---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Sites Store Mutation and Sync Guide"
summary: "Canonical guidance for mutating, synchronizing, and monitoring site data in the Zustand-based sites store."
created: "2025-11-21"
last_reviewed: "2026-01-08"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "sites"
 - "stores"
 - "monitoring"
 - "state-sync"
 - "ipc"
topics:
 - "renderer"
 - "monitoring"
 - "state-sync"
status: "active"
---

# Sites Store Mutation and Sync Guide

This guide captures the **canonical approach** for mutating site data from the
renderer and explains how the sites store participates in the wider
state-synchronization pipeline.

It backs the implementations in:

- `src/stores/sites/useSiteOperations.ts`
- `src/stores/sites/utils/operationHelpers.ts`
- `src/stores/sites/useSiteSync.ts`
- `src/stores/sites/utils/statusUpdateHandler.ts`
- `src/utils/cacheSync.ts`
- `src/hooks/useStatusSubscriptionHealth.ts`
- `electron/UptimeOrchestrator.ts`

If code ever diverges from this document, treat the **code plus this guide** as
the single source of truth and update both together.

## Table of Contents

1. [Mutation pipeline](#mutation-pipeline)
2. [Realtime subscription diagnostics](#realtime-subscription-diagnostics)
3. [State sync pipeline](#state-sync-pipeline)
4. [Monitoring lifecycle resync policy](#monitoring-lifecycle-resync-policy)
5. [Logging conventions](#logging-conventions)
6. [Related documentation](#related-documentation)

## Mutation pipeline

### Rely on backend reconciliation

All site mutations must treat the `Site` returned by the backend as
**authoritative**. The pattern is:

1. Read the current site from store state.
2. Build the new snapshot (e.g. by normalizing and appending monitors).
3. Call the appropriate `SiteService` method (`updateSite`, `addSite`,
   `removeMonitor`, etc.).
4. Persist the returned snapshot via `applySavedSiteToStore`.

Representative implementation from `createSiteOperationsActions`:

```typescript
const savedSite = await withSiteOperationReturning(
 "addMonitorToSite",
 async () => {
  const site = getSiteByIdentifier(siteIdentifier, deps);

  const normalizedMonitor = normalizeMonitorOrThrow(
   monitor,
   "Failed to normalize monitor before adding to site"
  );

  const updatedMonitors = [...site.monitors, normalizedMonitor];

  return deps.services.site.updateSite(siteIdentifier, {
   monitors: updatedMonitors,
  });
 },
 deps,
 {
  telemetry: { monitor, siteIdentifier },
  syncAfter: false,
 }
);

applySavedSiteToStore(savedSite, deps);
```

Key points:

- The backend-owned `Site` snapshot is always the last writer.
- `applySavedSiteToStore` performs identifier de-duplication via
  `ensureUniqueSiteIdentifiers` and logs anomalies before committing state.
- `syncAfter` **must be set to `false`** for these mutations so the helper does
  not schedule an additional `deps.syncSites()` call.

### Never dispatch `syncSites` for local mutations

`syncSites` is reserved for orchestrator-triggered recoveries and cold-start
bootstrapping. Local mutations—including adding, updating, and removing
monitors—**must not** call `deps.syncSites`.

Instead:

- Use `withSiteOperation` / `withSiteOperationReturning` with
  `syncAfter: false`.
- Rely on `applySavedSiteToStore` to reconcile the authoritative snapshot into
  the store.

Currently the only operation that calls `deps.syncSites()` is
`initializeSites`, which is explicitly treated as a **sync pipeline entrypoint**
for renderer bootstrap rather than a local mutation.

Unit tests (`useSiteOperations.test.ts` and
`useSiteOperations.targeted.test.ts`) assert that `addMonitorToSite` and
`removeMonitorFromSite` do not invoke `syncSites`. Any new mutation should add
comparable coverage before merging.

### Monitor removal workflow

Monitor deletion is orchestrator-owned and must follow the IPC contract
exactly. The renderer workflow is:

1. Call `SiteService.removeMonitor` (IPC to `sites.removeMonitor`) with the
   site identifier and monitor id.
2. Await the backend `Site` snapshot returned by that call.
3. Persist the snapshot with `applySavedSiteToStore` **without** issuing
   `syncSites`.

This guarantees:

- Duplicate identifiers are validated before the store is mutated.
- The in-memory sites store remains aligned with the orchestrator’s cache,
  even while the follow-up `cache:invalidated` event is in-flight.

Tests in `useSiteOperations.targeted.test.ts` simulate the subsequent
`applySavedSiteToStore` invocation to ensure optimistic state is reconciled
correctly once the orchestrator broadcasts the authoritative payload.

### Shared helpers

The helpers in `src/stores/sites/utils/operationHelpers.ts` are the only
supported building blocks for mutations:

- `getSiteByIdentifier` retrieves the current `Site` from state and throws a
  friendly `NOT_FOUND` error when missing.
- `applySavedSiteToStore` replaces (or inserts) the backend `Site` while
  preserving the rest of the collection and performing duplicate detection.
- `updateMonitorAndSave` composes the above with `updateMonitorInSite` to
  handle monitor-specific updates.
- `withSiteOperation` / `withSiteOperationReturning` wrap mutations with
  consistent error handling and telemetry, including optional `syncAfter`.

When introducing additional mutations, **compose these helpers** instead of
inventing new sync flows. This keeps monitor state transitions consistent and
minimizes IPC chatter.

#### Low-level state helpers (rare)

The sites store also exposes a low-level state mutation helper named
`applySiteSnapshot` (formerly `updateSite`).

- Use `applySiteSnapshot` only when you already have an authoritative `Site`
  snapshot and need to replace it in local state (replace-by-identifier).
- Prefer `applySavedSiteToStore` for the common mutation pipeline because it
  performs identifier de-duplication and logs anomalies before committing
  state.

## Realtime subscription diagnostics

Realtime diagnostics are modeled around a single source of truth:
`StatusUpdateSubscriptionSummary` (defined in
`src/stores/sites/baseTypes.ts`).

- `useSiteSync.subscribeToStatusUpdates` captures a
  `StatusUpdateSubscriptionSummary` and persists it via
  `setStatusSubscriptionSummary` on the sites store state.
- `StatusSubscriptionIndicator` (in
  `src/components/Header/StatusSubscriptionIndicator.tsx`) renders this summary
  and exposes a retry action.
- `retryStatusSubscription` clears the previous snapshot before re-subscribing,
  ensuring the indicator always reflects the latest attempt.
- `deriveStatusSubscriptionHealth` (from
  `src/hooks/useStatusSubscriptionHealth.ts`) converts raw listener counts and
  error state into a normalized health state (`healthy`, `degraded`, `failed`,
  `unknown`). Components should rely on this helper instead of duplicating
  heuristics.

`StatusUpdateManager` (in
`src/stores/sites/utils/statusUpdateHandler.ts`) owns the underlying event
subscriptions and incremental update strategy. The sites store treats its
output (`StatusUpdateSubscriptionResult`) as an internal implementation detail;
callers interact only with the summarized health data.

## State sync pipeline

State synchronization for the sites store is deliberately layered to keep the
IPC surface, orchestration logic, and local cache responsibilities separated.

### 1. StateSyncService (renderer IPC façade)

`src/services/StateSyncService.ts` exposes the renderer-facing state-sync API:

- `getSyncStatus()` wraps the `stateSync.getSyncStatus` IPC endpoint and
  parses the result into `StateSyncStatusSummary`.
- `requestFullSync()` wraps `stateSync.requestFullSync` and returns a validated
  `StateSyncFullSyncResult` snapshot.
- `onStateSyncEvent()` subscribes to incremental `StateSyncEventData`
  emissions from the preload events domain and coordinates automatic recovery
  via full sync when malformed payloads are encountered.

All methods rely on `getIpcServiceHelpers("StateSyncService")` so callers
never touch `window.electronAPI` directly.

### 2. useSiteSync (store-level orchestration)

`src/stores/sites/useSiteSync.ts` composes store actions on top of
`StateSyncService` and the shared snapshot helpers:

- `fullResyncSites()` coalesces concurrent requests, delegates to
  `syncSites()`, and logs pending/success/failure telemetry.
- `syncSites()` always performs a backend `requestFullSync()`, normalizes the
  resulting snapshot with `deriveSiteSnapshot`, and replaces the local
  `sites` state in a single step.
- `subscribeToSyncEvents()` wires `StateSyncService.onStateSyncEvent` into the
  store and uses `prepareSiteSyncSnapshot` plus `hasSiteSyncChanges` to derive
  incremental deltas. When no effective changes are present, the store update
  is skipped while still emitting the derived delta via `onSiteDelta`.
- `getSyncStatus()` is surfaced through the store so components can render
  high-level sync diagnostics without talking to the IPC layer. The summary
  normalizes `lastSyncAt` to `null` when no synchronization has completed and
  falls back to cached site counts when the database summary is not
  trustworthy.
- Status-update subscription helpers piggyback on this module but keep cache
  invalidations and state-sync semantics aligned with the broader pipeline.

### 3. Interaction with cache invalidation

Cache invalidation (`cache:invalidated`) remains the primary trigger for
resynchronization:

- `setupCacheSync` (in `src/utils/cacheSync.ts`) listens for invalidations and
  calls `useSitesStore.getState().fullResyncSites()`.
- A 200 ms debounce (`SITE_UPDATE_DEBOUNCE_MS`) ensures bursts of site-update
  invalidations collapse into a single resync.
- State-sync events describe _what_ changed, while cache invalidation drives
  _when_ a resync should occur. This split keeps the pipeline predictable and
  minimizes redundant work.

For a high-level, cross-layer overview of how these pieces interact with the
main process and preload bridge, see the
"State synchronization pipeline (sites & cache)" subsection in
`docs/Architecture/README.md`.

## Monitoring lifecycle resync policy

Main-process managers emit **internal lifecycle** topics for monitoring start
and stop (`internal:monitor:started` and `internal:monitor:stopped`).
Realtime telemetry such as `monitor:status-changed` continues to originate
from `MonitorManager` directly because the orchestrator does not perform any
additional enrichment on those payloads.

`UptimeOrchestrator` consumes the internal lifecycle events, recomputes the
aggregate monitor metrics, and then rebroadcasts two sanitized payloads per
lifecycle change:

- `monitoring:started` / `monitoring:stopped` telemetry events for dashboards.
- A follow-up `cache:invalidated` event that carries the authoritative signal
  to refresh site data. The orchestrator emits `{ type: "site", reason:
  "update" }` for scoped changes and `{ type: "all", reason: "update" }`
  when monitoring is toggled globally so the renderer can short-circuit to a
  full resync.

On the renderer side:

- `StatusUpdateManager` logs monitoring lifecycle telemetry via
  `handleMonitoringLifecycleEvent` but intentionally **does not** trigger a
  resync in response to these lifecycle events.
- `setupCacheSync` responds to `cache:invalidated` events and schedules
  `fullResyncSites()` with the 200 ms debounce so quick successive emissions
  collapse into one fetch.
- `createSiteSyncActions.fullResyncSites` coalesces concurrent callers by
  reusing a pending promise and logging each request for diagnostics.

`StatusUpdateManager` still uses `fullResyncSites()` as a **fallback** when an
incremental update cannot be safely applied (e.g. malformed payloads that pass
preload validation but fail downstream). This fallback must remain localized to
the status-update path; new features should prefer emitting/consuming
`cache:invalidated` over ad-hoc sync calls to keep dedupe guarantees intact.

## Logging conventions

Logging for sites, monitoring, and sync flows follows a shared convention so
dashboards and alerting pipelines can treat store logs uniformly:

- Store actions log three phases via `logStoreAction`:
  - `status: "pending"` (no `success` flag).
  - `status: "success"`, `success: true`.
  - `status: "failure"`, `success: false`.
- `withSiteOperation` and `withSiteOperationReturning` accept stage-specific
  telemetry (for example, `{ success: { message: "completed" } }`). Success
  metadata is emitted only after the operation resolves, preventing premature
  success telemetry in dashboards.
- Monitoring actions in `useSiteMonitoring.ts` mirror the same convention so
  CRUD, monitoring, and sync flows can be analyzed together.

## Related documentation

- `docs/Architecture/Stores/sites.md` – API-level documentation for the sites store.
- `docs/Architecture/README.md` – architectural overview, including the
  "State synchronization pipeline (sites & cache)" subsection.
- `docs/Guides/ZUSTAND_STORE_PATTERN_GUIDE.md` – decision guide for store
  composition patterns used by the sites store.
