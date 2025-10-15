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
  { monitor, siteIdentifier },
  deps,
  false
);

applySavedSiteToStore(savedSite, deps);
```

> Setting `syncAfter` to `false` is mandatory. Calling `applySavedSiteToStore` is the only supported post-mutation path.

## Never dispatch `syncSites` for local mutations

`syncSites` is reserved for orchestrator-triggered recoveries (e.g. IPC event mismatch, data corruption, cold start). Local mutations—including adding, updating, and removing monitors—must not call `deps.syncSites`. Doing so reintroduces the stale snapshot race that previously overwrote optimistic updates.

Unit tests (`useSiteOperations.test.ts` and `useSiteOperations.targeted.test.ts`) assert that `addMonitorToSite` and `removeMonitorFromSite` no longer invoke `syncSites`. Any new mutation should add comparable coverage before merging.

## Shared helpers

- `getSiteByIdentifier` retrieves the current `Site` from state and raises a friendly error when missing.
- `applySavedSiteToStore` replaces (or inserts) the persisted `Site` returned by the backend while preserving the rest of the collection.
- `updateMonitorAndSave` is layered on top of these helpers and should be used for monitor-specific updates.

When introducing additional mutations, compose these helpers instead of inventing new sync flows. This keeps monitor state transitions consistent and minimizes IPC chatter.
