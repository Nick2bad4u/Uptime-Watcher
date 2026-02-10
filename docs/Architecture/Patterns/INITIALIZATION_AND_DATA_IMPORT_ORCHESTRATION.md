---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Initialization & Data Import Orchestration"
summary: "Describes how DatabaseManager, UptimeOrchestrator, and the React App coordinate startup, transaction-completed events, data imports, and site lifecycle synchronization."
created: "2025-11-23"
last_reviewed: "2026-01-31"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "initialization"
  - "data-import"
  - "site-lifecycle"
---
# Initialization & Data Import Orchestration

This guide documents how the **Electron main process** and **React renderer** coordinate:

- Application startup and initialization phases
- `database:transaction-completed` event semantics
- JSON data imports and cache synchronization
- High-level site lifecycle flows (add site, add monitor, import data)

It complements the existing [Site Loading & Monitoring Orchestration](./SITE_LOADING_ORCHESTRATION.md) guide by focusing on cross-layer sequencing and event contracts rather than intra-process cache mechanics.

## Table of Contents

1. [High-Level Startup Phases](#high-level-startup-phases)
2. [`database:transaction-completed` Event Semantics](#databasetransaction-completed-event-semantics)
3. [Data Import & Cache Synchronization](#data-import--cache-synchronization)
4. [Site Lifecycle Flows](#site-lifecycle-flows)
5. [Maintenance Checklist](#maintenance-checklist)

## High-Level Startup Phases

At a high level, startup is divided into three phases:

1. **Database initialization** – `DatabaseManager.initialize()`
2. **Orchestrator bootstrap** – `UptimeOrchestrator.initialize()`
3. **Renderer bootstrap** – `App.initializeApp()` in `src/App.tsx`

   ```mermaid
   sequenceDiagram
      participant DB as DatabaseManager
      participant Orchestrator as UptimeOrchestrator
      participant Events as TypedEventBus
      participant Renderer as React App (App.tsx)

      Note over DB: Process startup (main process)

      DB->>DB: initialize()
      DB-->>Events: emit database:transaction-completed<br/>operation="database:initialize"

      Note over Orchestrator: Constructed with DatabaseManager,<br/>SiteManager, MonitorManager

      Orchestrator->>DB: initialize() (invoked via orchestrator.initialize())
      Orchestrator->>Orchestrator: resumePersistentMonitoring()
      Orchestrator-->>Events: emit database:transaction-completed<br/>operation="initialize"

      Note over Renderer: Renderer entrypoint

      Renderer->>Renderer: App.initializeApp() effect runs
      Renderer->>Stores: initializeSettings(), initializeSites()
      Renderer->>Renderer: setupCacheSync(), subscribeToSyncEvents()
      Renderer->>Renderer: subscribeToStatusUpdates()
   ```

### DatabaseManager.initialize()

`electron/managers/DatabaseManager.ts` owns low-level initialization:

- Loads history-retention rules from `ConfigurationManager`.
- Attempts to read the persisted `historyLimit` from `SettingsRepository` and
  normalizes it via the shared `normalizeHistoryLimit` helper.
- Initializes the underlying `DatabaseService` (synchronous in the current
  implementation) and hydrates the site cache using `SiteLoadingOrchestrator`.
- Emits a `database:transaction-completed` event with:

  ```ts
  {
      duration: 0,
      operation: "database:initialize",
      recordsAffected: 0,
      success: true,
      timestamp: Date.now(),
  }
  ```

This event represents the **database-level** completion signal: schema setup,
settings hydration, and initial site loading.

### UptimeOrchestrator.initialize()

`electron/UptimeOrchestrator.ts` is constructed with injected
`DatabaseManager`, `SiteManager`, and `MonitorManager` instances. Its
`initialize()` method:

1. Calls `databaseManager.initialize()`.
2. Calls `siteManager.initialize()` to ensure cache and domain invariants are
   established.
3. Calls `resumePersistentMonitoring()` to re-register and resume any monitors
   that were previously marked as `monitoring: true` for sites whose
   `monitoring` flag is also `true`.
4. Validates that all managers expose their required methods.

When the orchestrator receives the internal `internal:database:initialized`
event, it emits a second `database:transaction-completed` event:

```ts
await this.emitTyped("database:transaction-completed", {
 duration: 0,
 operation: "initialize",
 success: true,
 timestamp: Date.now(),
});
```

This event represents the **orchestrator-level** completion signal: database,
site manager, and monitoring wiring are all ready.

> **Consumer guidance:**
>
> - Listeners that care about low-level initialization (e.g. metrics pipelines)
>   should filter on `operation === "database:initialize"`.
> - Listeners that only need to know when the orchestrator is ready for
>   frontend coordination should filter on `operation === "initialize"`.
>
> Do **not** assume there is only a single `database:transaction-completed`
> emission; always inspect `operation`.

### App.initializeApp() (Renderer Bootstrap)

The React entry point in `src/App.tsx` performs renderer-side bootstrap inside
an effect via the `initializeApp` callback:

1. Logs startup and, in production builds, calls `logger.app.started()`.

2. Retrieves live store instances via `useSitesStore.getState()` and
   `useSettingsStore.getState()`.

3. Sequentially initializes:
   - **Settings store** via `initializeSettings`.
   - **Notification bridge** via `NotificationPreferenceService.initialize()`
     (with warnings logged on failure).
   - **Notification preferences** via `synchronizeNotificationPreferences()`.
   - **Sites store** via `initializeSites`.

4. Establishes cache synchronization and event subscriptions:
   - Calls `setupCacheSync()` to wire backend state-sync events into renderer
     stores.
   - Subscribes to backend sync events via `sitesStore.subscribeToSyncEvents()`.
   - Subscribes to monitoring status updates via
     `sitesStore.subscribeToStatusUpdates()`, delegating to
     `enqueueAlertFromStatusUpdate` and `logStatusUpdateDebugInfo`.

5. Marks initialization complete by setting `isInitialized` to `true`, enabling
   the loading overlay to behave correctly for subsequent operations.

The entire pipeline is wrapped in a `try/catch` that:

- Logs any unhandled errors via `logger.error`.
- Pushes a user-visible message to `useErrorStore` with a fallback text when no
  message is available.

This keeps the renderer resilient to unexpected startup issues while providing
clear diagnostics.

## `database:transaction-completed` Event Semantics

All `database:transaction-completed` events share the same typed shape from
`UptimeEvents`, but differ in their `operation` field.

Current operations of interest:

- `"database:initialize"` – emitted by `DatabaseManager.initialize()` after
  database services and site loading complete successfully.
- `"initialize"` – emitted by `UptimeOrchestrator` once the full orchestrator
  bootstrap (database + site manager + monitoring wiring) has completed.

When adding new operations (for example, long-running migrations or
re-indexing), follow these guidelines:

1. Use a clear, namespaced operation identifier
   (e.g. `"database:migrate-v2"`, `"database:reindex-history"`).
2. Ensure each distinct operation is documented here and in the relevant ADRs.
3. Avoid reusing operation names between logically distinct phases.

## Data Import & Cache Synchronization

This section describes how JSON-based data imports flow through the system.

### Import entrypoint

From the renderer’s perspective, imports are initiated via an IPC-backed
service (for example, a settings or maintenance screen) that ultimately calls
into `UptimeOrchestrator.importData(data: string)` in the Electron main
process.

### DatabaseManager.importData()

`DatabaseManager.importData(data)` coordinates the import using the
command-pattern implementation in
`electron/services/commands/DatabaseCommands.ts`:

1. Wraps the operation in `withErrorHandling` using `monitorLogger` to provide
   normalized logging and error reporting.

2. Constructs an `ImportDataCommand` with:
   - The current `siteCache`.
   - The `ConfigurationManager` (for validation rules).
   - The `TypedEventBus<UptimeEvents>`.
   - The `DatabaseServiceFactory`.
   - An `updateHistoryLimit` callback that delegates to
     `DatabaseManager.setHistoryLimit`.

3. Executes the command, which:
   - Parses the JSON payload into `settings` and `sites`.
   - Validates site identifiers and configuration via
     `ConfigurationManager.validateSiteConfiguration`.
   - Persists imported data through the import/export service.
   - Applies any imported history-limit settings via the provided
     `updateHistoryLimit` callback.
   - Reloads sites from the database and replaces the in-memory site cache.
   - Emits `internal:site:added` for newly imported sites using
     `SITE_ADDED_SOURCE.IMPORT`.
   - Emits `internal:database:data-imported` with `success: true` and
     `operation: "data-imported"`.

4. On failure (command throws), `DatabaseManager.importData` catches the error
   and attempts to emit a failure event:

   ```ts
   await this.eventEmitter.emitTyped("internal:database:data-imported", {
    operation: "data-imported",
    success: false,
    timestamp: Date.now(),
   });
   ```

   The method then returns `false` to its caller. Any underlying error details
   are already logged by `withErrorHandling`.

> **Event source semantics:**
>
> - **Success** events (`success: true`) are emitted by the
>   `ImportDataCommand` once cache replacement and persistence succeed.
> - **Failure** events (`success: false`) are emitted by
>   `DatabaseManager.importData` when the command or its validation fails.
>
> This split keeps the happy-path emission close to the command while
> centralizing failure reporting in the manager.

### Site synchronization after imports

After imports, site synchronization flows through the same
`sites:state-synchronized` pipeline used by other cache mutations:

1. The site cache is replaced atomically inside `ImportDataCommand` using
   `StandardizedCache.replaceAll`.
2. `DatabaseManager` and `SiteManager` coordinate subsequent
   `emitSitesStateSynchronized` calls when sites are mutated or refreshed.
3. `UptimeOrchestrator` forwards state sync payloads to renderer listeners by
   rebroadcasting the internal `sites:state-synchronized` `StateSyncEventData`
   payload over the
   renderer IPC channel `state-sync-event` (consumed through
   `StateSyncService.onStateSyncEvent`). This keeps `sites:state-synchronized`
   as an internal main-process topic while still letting Zustand stores and
   components converge on the latest snapshot.

`ImportDataCommand` **no longer** emits `sites:state-synchronized` directly;
that responsibility is owned by `SiteManager`/`UptimeOrchestrator` to ensure a
single high-level entry point for bulk sync events.

## Site Lifecycle Flows

This section summarizes the main site lifecycle flows that interact with the
initialization and import orchestration described above.

### Add Site (New Site)

1. **Renderer form** – `AddSiteForm` in
   `src/components/AddSiteForm/AddSiteForm.tsx` collects user input and
   delegates submission to `handleSubmit` in `Submit.tsx`.

2. **Monitor validation & creation** – `handleSubmit`:
   - Normalizes raw form data via `buildMonitorFormData`.
   - Validates monitor-type-specific fields using
     `validateMonitorFormData(monitorType, formData)`.
   - Validates `checkInterval` via `validateMonitorFieldClientSide` using the
     active `monitorType`.
   - Builds a canonical `Monitor` via the shared `createMonitorObject` helper
     and attaches `id`, `checkInterval`, and `activeOperations`.

3. **Store & IPC integration** – Depending on `addMode`:
   - For `"new"`, `handleSubmit` calls `createSite` on `useSitesStore` with:

     ```ts
     {
         identifier: siteIdentifier,
         monitors: [monitor],
         name: trimmedName || DEFAULT_SITE_NAME,
     }
     ```

   - The store implementation uses a service layer (e.g. `SitesService`) and
     typed IPC to invoke `UptimeOrchestrator.addSite()` in the main process.

4. **Main-process orchestration** – `UptimeOrchestrator.addSite`:
   - Adds the site via `SiteManager.addSite`.
   - Calls `MonitorManager.setupSiteForMonitoring` for the new site.
   - On failure during monitoring setup, attempts to remove the site and logs
     contextual errors.

5. **Events & sync** – `SiteManager` emits internal site events that are
   forwarded by `UptimeOrchestrator` to public renderer events:
   - `internal:site:added` → forwarded as `site:added` with
     `source: SITE_ADDED_SOURCE.USER`.
   - Cache updates trigger internal `sites:state-synchronized` events carrying
     sanitized site snapshots, which are forwarded to the renderer via
     `state-sync-event`.

6. **Renderer convergence** – Renderer stores subscribe to incremental state
   sync events via `StateSyncService.onStateSyncEvent` (IPC channel:
   `state-sync-event`) and update their in-memory state. Components such as
   `SiteList` and `DashboardOverview` re-render based on store changes.

### Add Monitor to Existing Site

The flow is similar to adding a new site but uses `addMonitorToSite` on the
sites store instead of `createSite`:

1. `AddSiteForm` is configured with `addMode === "existing"`.
2. `handleSubmit` validates monitor configuration as above.
3. On success, `addMonitorToSite(existingIdentifier, monitor)` is called.
4. The store delegates to the main process, where `SiteManager` mutates the
   existing site and `MonitorManager` updates scheduling via
   `restartMonitorWithNewConfig` or related helpers.
5. Updated snapshots propagate through the same
   `internal:site:updated` → `site:updated` + `sites:state-synchronized`
   pipeline.

### Import Data

The import flow reuses the same primitives:

1. Renderer code obtains JSON (for example, from a file chooser) and sends it
   to an IPC layer that invokes `UptimeOrchestrator.importData(data)`.
2. `DatabaseManager.importData` and `ImportDataCommand` perform the import as
   described in [Data Import & Cache Synchronization](#data-import--cache-synchronization).
3. Newly imported sites trigger `internal:site:added` events with
   `source: SITE_ADDED_SOURCE.IMPORT`, which are forwarded to the renderer as
   `site:added`.
4. Subsequent cache mutations emit `sites:state-synchronized` events, ensuring
   renderer stores reconcile with the authoritative backend state.

## Maintenance Checklist

When evolving initialization, import, or site lifecycle flows:

- [ ] Update this document whenever new `database:transaction-completed`
  operations or import-related events are introduced.
- [ ] Keep `ImportDataCommand` free of `sites:state-synchronized` emissions;
  bulk sync must remain coordinated by `SiteManager`/`UptimeOrchestrator`.
- [ ] Maintain the separation between database-level and orchestrator-level
  initialization events; do not reuse operation identifiers for distinct
  phases.
- [ ] Ensure new site/monitor flows continue to use shared monitor validation
  and creation utilities.
- [ ] Keep renderer bootstrap (`App.initializeApp`) resilient by guarding
  top-level initialization with `try/catch` and reporting errors through
  `useErrorStore`.
