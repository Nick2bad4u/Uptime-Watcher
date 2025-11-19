# Sites Store Mutation Guidance

This note captures the canonical approach for mutating site data from the renderer. It is intended to backstop the implementation in `src/stores/sites/useSiteOperations.ts` and the surrounding helpers.

## Rely on backend reconciliation

All site mutations must treat the `Site` returned by the backend as authoritative. Call `SiteService.updateSite` (or the equivalent IPC helper) and feed the returned entity through `applySavedSiteToStore`. This ensures:

- optimistic updates are confirmed against the orchestrator result,
- the Zustand store always holds the enriched `Site`, including backend-side defaults, and
- we never schedule a redundant `syncSites` refresh unless the backend explicitly fails to supply data.

```ts
const savedSite = await withSiteOperationReturning(
  "addMonitorToSite",
  async () => {
    const site = getSiteByIdentifier(siteIdentifier, deps);
    const updatedMonitors = [...site.monitors, normalizeMonitorOrThrow(monitor)];
    return deps.services.site.updateSite(siteIdentifier, { monitors: updatedMonitors });
  },
  deps,
  {
    telemetry: { monitor, siteIdentifier },
    syncAfter: false,
  }
);

applySavedSiteToStore(savedSite, deps);
```

> Setting `syncAfter` to `false` is mandatory. Calling `applySavedSiteToStore` is the only supported post-mutation path.

## Never dispatch `syncSites` for local mutations

`syncSites` is reserved for orchestrator-triggered recoveries (e.g. IPC event mismatch, data corruption, cold start). Local mutations—including adding, updating, and removing monitors—must not call `deps.syncSites`. Doing so reintroduces the stale snapshot race that previously overwrote optimistic updates.

Unit tests (`useSiteOperations.test.ts` and `useSiteOperations.targeted.test.ts`) assert that `addMonitorToSite` and `removeMonitorFromSite` no longer invoke `syncSites`. Any new mutation should add comparable coverage before merging.

## Monitor removal workflow

Monitor deletion is orchestrator-owned. The renderer must:

1. Call `SiteService.removeMonitor` (IPC to `sites.removeMonitor`) with the site identifier and monitor id.
2. Await the backend snapshot returned by that call.
3. Persist the snapshot with `applySavedSiteToStore` **without** issuing `syncSites`.

The helper guarantees duplicate identifier validation and keeps the in-memory store aligned with the orchestrator while the formal sync event is in-flight. Tests in `useSiteOperations.targeted.test.ts` simulate the subsequent `applySavedSiteToStore` invocation to ensure the optimistic state is reconciled correctly once the orchestrator broadcasts the authoritative payload.

## Shared helpers

- `getSiteByIdentifier` retrieves the current `Site` from state and raises a friendly error when missing.
- `applySavedSiteToStore` replaces (or inserts) the persisted `Site` returned by the backend while preserving the rest of the collection.
- `updateMonitorAndSave` is layered on top of these helpers and should be used for monitor-specific updates.

When introducing additional mutations, compose these helpers instead of inventing new sync flows. This keeps monitor state transitions consistent and minimizes IPC chatter.

## Realtime subscription diagnostics

- `useSiteSync.subscribeToStatusUpdates` captures a `StatusUpdateSubscriptionSummary` and persists it via `setStatusSubscriptionSummary`. Components render the summary through `StatusSubscriptionIndicator`.
- `retryStatusSubscription` clears the previous snapshot before re-subscribing so the indicator reflects the latest attempt. Consumers should rely on the returned summary rather than mixing derived state.
- The `deriveStatusSubscriptionHealth` helper converts raw listener counts into a normalized health state (`healthy`, `degraded`, `failed`, `unknown`). Use it instead of duplicating heuristics in components.

## State sync pipeline

State synchronization for the sites store is deliberately layered to keep the
IPC surface, orchestration logic, and local cache responsibilities separated:

1. **StateSyncService (renderer IPC façade)**
   - `src/services/StateSyncService.ts` exposes the renderer-facing
     state-sync API:
     - `getSyncStatus()` wraps the `stateSync.getSyncStatus` IPC endpoint and
       parses the result into `StateSyncStatusSummary`.
     - `requestFullSync()` wraps `stateSync.requestFullSync` and returns a
       validated `StateSyncFullSyncResult` snapshot.
     - `onStateSyncEvent()` subscribes to incremental `StateSyncEventData`
       emissions from the preload events domain, including recovery when
       malformed payloads are encountered.
   - All methods rely on `getIpcServiceHelpers("StateSyncService")` so
     callers never touch `window.electronAPI` directly.

2. **useSiteSync (store-level orchestration)**
   - `src/stores/sites/useSiteSync.ts` composes the store actions on top of
     `StateSyncService` and the shared snapshot helpers:
     - `fullResyncSites()` coalesces concurrent requests, calls
       `StateSyncService.requestFullSync()`, normalizes the resulting
       snapshot, and replaces the local `sites` state in a single step.
     - `syncSites()` uses `prepareSiteSyncSnapshot` / `deriveSiteSnapshot` to
       apply incremental updates based on the authoritative backend data.
     - `subscribeToSyncEvents()` wires `StateSyncService.onStateSyncEvent`
       into the store, dispatching sync actions whenever the backend emits
       state-sync events.
     - `getSyncStatus()` is surfaced through the store so components can
       render high-level sync diagnostics without talking to the IPC layer.

3. **Interaction with cache invalidation**
   - Cache invalidation (`cache:invalidated`) remains the primary trigger for
     resynchronization. `useSiteSync` uses a short debounce window when
     responding to invalidations so bursts of events result in a single
     `fullResyncSites()` call.
   - State-sync events describe *what* changed, while cache invalidation
     drives *when* a resync should occur. This split keeps the pipeline
     predictable and minimizes redundant work.

For a high-level, cross-layer overview of how these pieces interact with the
main process and preload bridge, see the "State synchronization pipeline
(sites & cache)" subsection in `docs/Architecture/README.md`.

## Monitoring lifecycle resync policy

Main-process managers now emit the **internal lifecycle** topics for monitoring
start and stop (`internal:monitor:started` and `internal:monitor:stopped`).
Real-time telemetry such as `monitor:status-changed` continues to originate
from `MonitorManager` directly because the orchestrator does not perform any
additional enrichment on those payloads. The `UptimeOrchestrator` consumes the
internal lifecycle events, recomputes the aggregate monitor metrics, and then
rebroadcasts two sanitized payloads per lifecycle change:

- `monitoring:started` / `monitoring:stopped` telemetry events for dashboards.
- A follow-up `cache:invalidated` event that carries the authoritative signal
  to refresh site data. The orchestrator emits `{ type: "site", reason:
  "update" }` for scoped changes and `{ type: "all", reason: "update" }`
  when monitoring is toggled globally so the renderer can short-circuit to a
  full resync.

The renderer continues to treat cache invalidations as the single source of
truth:

- `StatusUpdateManager` logs lifecycle telemetry but deliberately avoids
  calling `fullResyncSites()`.
- `setupCacheSync` listens for cache invalidations and schedules
  `fullResyncSites()` with a 200 ms debounce (`SITE_UPDATE_DEBOUNCE_MS`) so
  quick successive emissions collapse into one fetch.
- `createSiteSyncActions.fullResyncSites` coalesces concurrent callers by
  reusing the pending promise and logging the event for diagnostics.

When wiring new lifecycle hooks (e.g., automatic retries) prefer
emitting/consuming cache invalidations over ad-hoc sync calls to keep the
dedupe guarantees intact.

## Logging conventions

- Store actions log three phases: `status: "pending"`, `status: "success"` (`success: true`), and `status: "failure"` (`success: false`). Pending entries intentionally omit a `success` flag.
- `withSiteOperation` and `withSiteOperationReturning` accept stage-specific telemetry (e.g., `{ success: { message: "completed" } }`). Success metadata appears only after the operation resolves, preventing premature success telemetry in dashboards.
- Monitoring actions mirror the same convention so alerting pipelines can treat store logs uniformly across CRUD, monitoring, and sync flows.
