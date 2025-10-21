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

## Monitoring lifecycle resync policy

The orchestrator emits two event families when monitoring starts or stops:

- `monitoring:started` / `monitoring:stopped` telemetry events for dashboards.
- A follow-up `cache:invalidated` event with `{ type: "site", reason: "update" }` that carries the authoritative signal to refresh site data.

The renderer treats the cache invalidation as the single source of truth:

- `StatusUpdateManager` now logs the lifecycle telemetry but deliberately avoids calling `fullResyncSites()`.
- `setupCacheSync` listens for the site-scoped invalidation and schedules `fullResyncSites()` with a 200 ms debounce (`SITE_UPDATE_DEBOUNCE_MS`) so quick successive emissions collapse into one fetch.
- `createSiteSyncActions.fullResyncSites` coalesces concurrent callers by reusing the pending promise and logging the event for diagnostics.

When wiring new lifecycle hooks (e.g., automatic retries) prefer emitting/consuming cache invalidations over ad-hoc sync calls to keep the dedupe guarantees intact.

## Logging conventions

- Store actions log three phases: `status: "pending"`, `status: "success"` (`success: true`), and `status: "failure"` (`success: false`). Pending entries intentionally omit a `success` flag.
- `withSiteOperation` and `withSiteOperationReturning` accept stage-specific telemetry (e.g., `{ success: { message: "completed" } }`). Success metadata appears only after the operation resolves, preventing premature success telemetry in dashboards.
- Monitoring actions mirror the same convention so alerting pipelines can treat store logs uniformly across CRUD, monitoring, and sync flows.
