---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "API & IPC Documentation"
summary: "Comprehensive reference for Uptime Watcher's IPC communication and API surface."
created: "2025-09-22"
last_reviewed: "2026-01-11"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "ipc"
 - "api"
 - "electron"
 - "events"
---

# 📡 API & IPC Documentation

## Table of Contents

1. [📋 Overview](#-overview)
2. [☁️ Cloud Sync & Backups IPC](#️-cloud-sync--backups-ipc)

## 📋 Overview

Uptime Watcher uses type-safe IPC (Inter-Process Communication) between the Electron main process and React renderer, along with an event-driven architecture for internal communication.

## ☁️ Cloud Sync & Backups IPC

The cloud domain exposes request/response IPC operations used by the Cloud Sync
and Remote Backups UI.

Canonical source of truth:

- IPC map: `shared/types/ipc.ts`
- Preload channel definitions: `shared/types/preload.ts`
- Renderer wrapper: `src/services/CloudService.ts`
- Renderer store: `src/stores/cloud/useCloudStore.ts`

Important channels:

- `cloud-connect-dropbox`
- `cloud-get-status`
- `cloud-enable-sync`
- `cloud-list-backups`
- `cloud-upload-latest-backup`
- `cloud-restore-backup`
- `cloud-set-encryption-passphrase`
- `cloud-clear-encryption-key`
- `cloud-migrate-backups`
- `cloud-preview-reset-remote-sync`
- `cloud-reset-remote-sync`

### Store Integration with Event Listeners (Zustand example)

The renderer uses a dedicated Zustand store (`useSitesStore`) that consumes IPC-backed services (`SiteService`, `StateSyncService`, and others) and reacts to typed events. For a complete, up-to-date code sample, see the **Store Integration with Event Listeners** section later in this document.

### Site lifecycle subscriptions via `EventsService`

````markdown
The renderer now exposes dedicated helpers for site lifecycle events. Using the
service keeps cleanup logic consistent with other IPC subscriptions and avoids
directly referencing `window.electronAPI` throughout the UI layer.

```typescript
import { useEffect } from "react";

import { EventsService } from "../services/EventsService";
import { useSitesStore } from "../stores/useSitesStore";

export function useSiteLifecycleEvents(): void {
 const addSite = useSitesStore((state) => state.addSite);
 const updateSite = useSitesStore((state) => state.updateSite);
 const removeSite = useSitesStore((state) => state.removeSite);

 useEffect(() => {
  const disposers: Array<() => void> = [];
  let cancelled = false;

  void EventsService.initialize()
   .then(async () => {
    if (cancelled) {
     return;
    }

    disposers.push(
     await EventsService.onSiteAdded(({ site }) => {
      addSite(site);
     }),
     await EventsService.onSiteUpdated(({ site }) => {
      updateSite(site.identifier, site);
     }),
     await EventsService.onSiteRemoved(({ siteIdentifier }) => {
      removeSite(siteIdentifier);
     })
    );
   })
   .catch((error) => {
    console.error("Failed to subscribe to site events", error);
   });

  return () => {
   cancelled = true;
   disposers.splice(0).forEach((dispose) => {
    try {
     dispose();
    } catch (error) {
     console.error("Failed to dispose site event handler", error);
    }
   });
  };
 }, [
  addSite,
  updateSite,
  removeSite,
 ]);
}
```

```typescript
if (result) {
 console.log(`Manual check completed at ${new Date(result.timestamp)}`);
}
```

#### `startMonitoring(): Promise<MonitoringStartSummary>`

Starts monitoring for every configured site. Resolves to a `MonitoringStartSummary` describing how many monitors were attempted, how many succeeded, and whether any partial failures occurred. The summary is also attached to the `monitoring:started` renderer event.

```typescript
const summary = await MonitoringService.startMonitoring();

if (!summary.isMonitoring) {
 throw new Error(
  `Monitoring failed: ${summary.failed}/${summary.attempted} monitors could not be activated.`
 );
}

if (summary.partialFailures) {
 console.warn(
  `${summary.failed} monitors failed to start; check backend diagnostics for details.`
 );
}
```

#### `stopMonitoring(): Promise<MonitoringStopSummary>`

Stops all active monitors. Resolves to a `MonitoringStopSummary` detailing how many monitors were stopped, which ones (if any) remained active, and whether the system was already inactive. The summary is mirrored to the `monitoring:stopped` renderer event.

```typescript
const summary = await MonitoringService.stopMonitoring();

if (summary.isMonitoring) {
 console.warn(
  `${summary.failed} monitors remained active after stop request. ` +
   "Investigate backend logs for stuck monitors."
 );
}

if (summary.partialFailures) {
 console.warn(
  `${summary.failed} monitors still running out of ${summary.attempted}.`
 );
}
```

#### `startMonitoringForMonitor(siteIdentifier: string, monitorId: string): Promise<void>`

Starts monitoring for a specific monitor belonging to the given site.

- Resolves when the backend confirms that monitoring has started for the targeted monitor.
- Throws an `Error` when the backend reports failure for that monitor.

The renderer services and stores treat this method as a fire-and-validate operation; any follow-up status updates arrive via the usual monitoring events.

```typescript
await MonitoringService.startMonitoringForMonitor(
 siteIdentifier,
 specificMonitorId
);
```

#### `startMonitoringForSite(siteIdentifier: string): Promise<boolean>`

Starts monitoring for every monitor associated with the provided site.

```typescript
await MonitoringService.startMonitoringForSite(siteIdentifier);
```

#### `stopMonitoringForMonitor(siteIdentifier: string, monitorId: string): Promise<boolean>`

Stops monitoring for a single monitor.

```typescript
await MonitoringService.stopMonitoringForMonitor(siteIdentifier, monitorId);
```

#### `stopMonitoringForSite(siteIdentifier: string): Promise<boolean>`

Stops monitoring for all monitors of a given site.

```typescript
await MonitoringService.stopMonitoringForSite(siteIdentifier);
```

#### `validateMonitorData(type: string, data: unknown): Promise<ValidationResult>`

Validates monitor configuration against type-specific schemas. The returned {@link ValidationResult} mirrors the shared contract used across the application (`success`, `errors`, `warnings`, optional `data`/`metadata`).

```typescript
const validation = await MonitorTypesService.validateMonitorData("http", {
 url: "https://example.com",
 timeout: 5000,
});

if (!validation.success) {
 validation.errors.forEach((message) => notifyUser(message));
}
```

#### `formatMonitorDetail(type: string, detail: string): Promise<string>`

Applies monitor-specific formatting to detail strings in the renderer UI.

```typescript
const formatted = await MonitorTypesService.formatMonitorDetail(
 "http",
 "status ok"
);
// e.g. "HTTP • status ok"
```

#### `formatMonitorTitleSuffix(type: string, monitor: Monitor): Promise<string>`

Returns a human-friendly suffix for monitor titles (e.g., HTTP method or host name).

```typescript
const suffix = await MonitorTypesService.formatMonitorTitleSuffix(
 "http",
 monitor
);
// e.g. "(GET)"
```

### Data API (`DataService`)

> Primary entry point: `@app/services/DataService`. Internally this uses the
> typed `data` domain exposed by the preload bridge via
> `getIpcServiceHelpers("DataService")`, so UI code never touches
> `window.electronAPI` directly.

#### `exportData(): Promise<string>`

Exports the full application dataset (sites, monitors, history snapshots, and settings) as a JSON string.

```typescript
const payload = await DataService.exportData();
const snapshot = JSON.parse(payload);
```

#### `importData(serialized: string): Promise<boolean>`

Imports a previously exported dataset. The argument must be the raw JSON string produced by `exportData()`.

```typescript
const success = await DataService.importData(payload);
if (!success) {
 notify("Import reported validation failures");
}
```

#### `downloadSqliteBackup(): Promise<SerializedDatabaseBackupResult>`

Generates a SQLite database backup and returns a transferable payload containing the binary buffer, file metadata, and the suggested download file name.

```typescript
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

const backup: SerializedDatabaseBackupResult =
 await DataService.downloadSqliteBackup();

await handleSQLiteBackupDownload(async () => backup);
// Downloads `backup.fileName` using the ArrayBuffer payload.
```

> The renderer receives an `ArrayBuffer`, ensuring compatibility with browser APIs without leaking Node.js `Buffer` instances. Additional metadata (size, creation timestamp, and original on-disk location) can be used for analytics or audit logging.
>
> Backup metadata now includes `schemaVersion`, `checksum`, `appVersion`, and a `retentionHintDays` value from ADR-013. Consumers should persist these fields alongside the backup for restore validation and user-facing guidance (for example, surfacing schema version and creation time in the Settings modal).

#### `restoreSqliteBackup(payload: SerializedDatabaseRestorePayload): Promise<SerializedDatabaseRestoreResult>`

Restores a previously downloaded SQLite backup. The payload must be an `ArrayBuffer` created from the `.sqlite` file along with the source file name (used for logging/UI only).

```typescript
import type { SerializedDatabaseRestorePayload } from "@shared/types/ipc";

const file = await pickFile();
const payload: SerializedDatabaseRestorePayload = {
 buffer: await file.arrayBuffer(),
 fileName: file.name,
};
const summary = await DataService.restoreSqliteBackup(payload);

console.info("Restored backup", {
 checksum: summary.metadata.checksum,
 schemaVersion: summary.metadata.schemaVersion,
 restoredAt: summary.restoredAt,
});
```

The main process re-validates the payload (checksum, size, schema version) using `validateDatabaseBackupPayload`, writes a pre-restore snapshot to disk, replaces the active database file, and emits cache invalidation events. The returned summary mirrors the download metadata, enabling the UI to confirm the restore operation (e.g., "Restored backup created on 2025-12-05 · schema v7").

### Monitor Types API (`MonitorTypesService`)

> Primary entry point: `@app/services/MonitorTypesService`. Internally this
> uses the typed `monitorTypes` domain from the preload bridge via
> `getIpcServiceHelpers("MonitorTypesService")`, keeping lifecycle controls
> within the monitoring domain. This aligns with ADR-005 by routing all
> monitor metadata helpers (registry lookup, formatting, and validation)
> through the dedicated monitor-types bridge.

#### `getMonitorTypes(): Promise<MonitorTypeConfig[]>`

Retrieves the full registry of available monitor types, including validation metadata and editor hints.

```typescript
const monitorTypes = await MonitorTypesService.getMonitorTypes();
// Returns serialized configurations (no prototype functions)
```

### Settings API (`SettingsService`)

> Primary entry point: `@app/services/SettingsService`. Internally this uses
> the typed `settings` domain from the preload bridge via
> `getIpcServiceHelpers("SettingsService")`, ensuring renderer code only sees
> a service abstraction rather than raw IPC or `window.electronAPI`.

#### `getHistoryLimit(): Promise<number>`

Retrieves the current history retention limit (in days).

```typescript
const limit = await SettingsService.getHistoryLimit();
```

#### `resetSettings(): Promise<void>`

Restores application settings to their factory defaults while leaving domain state untouched (sites, monitors, and history remain intact).

```typescript
await SettingsService.resetSettings();
```

#### `updateHistoryLimit(limitDays: number): Promise<number>`

Sets the history retention limit and returns the final, sanitised value used by
the backend.

If the caller supplies an invalid limit (for example, exceeding the configured
maximum), the request is rejected with a `TypeError` and no change is
persisted. When the requested limit is valid but the backend responds with an
invalid value, the renderer falls back to a sanitised version of the requested
limit and logs structured diagnostics; see the "History limit propagation
(settings & database)" section in `docs/Architecture/README.md` for the
end-to-end flow.

```typescript
const updatedLimit = await SettingsService.updateHistoryLimit(45);
```

### State Sync API (`StateSyncService`)

> Primary entry point: `@app/services/StateSyncService`. Internally this uses
> the typed `stateSync` invoke domain and the `events.onStateSyncEvent`
> subscription surface from the preload bridge via
> `getIpcServiceHelpers("StateSyncService")`, so renderer code never talks to
> `window.electronAPI` directly.

#### `getSyncStatus(): Promise<StateSyncStatusSummary>`

Retrieves the latest synchronization status snapshot, including last sync time, site count, and origin.

```typescript
const status = await StateSyncService.getSyncStatus();
console.log(`Last sync: ${status.lastSyncAt}`);
```

#### `requestFullSync(): Promise<StateSyncFullSyncResult>`

Performs a full synchronization round-trip and returns the authoritative site snapshot.

Internally, the main process emits a typed `sites:state-synchronized` event on
its event bus, and the renderer receives the corresponding broadcast via the
`state-sync-event` IPC channel (consumed through
`StateSyncService.onStateSyncEvent`).

```typescript
const { sites } = await StateSyncService.requestFullSync();
useSitesStore.getState().setSites(sites);
```

#### `onStateSyncEvent(callback: (event: StateSyncEventData) => void): Promise<() => void>`

Registers a listener for incremental state sync events (bulk-sync, update, delete). Returns a cleanup function to unsubscribe.

```typescript
const cleanup = await StateSyncService.onStateSyncEvent((event) => {
 if (event.action === "bulk-sync") {
  useSitesStore.getState().setSites(event.sites);
 }
});

// Later: cleanup();
```

### System API (`SystemService`)

#### `openExternal(url: string): Promise<boolean>`

Opens HTTP(S) URLs in the user's default external browser. The call resolves to
`true` when Electron successfully delegates the navigation request.

Under the hood this delegates to the typed `system` preload domain
(`window.electronAPI.system.openExternal`) via `SystemService`, so renderer
code never talks to the raw bridge directly. The service enforces URL
validation, logging, and consistent error reporting.

```typescript
import { SystemService } from "@app/services/SystemService";

await SystemService.openExternal("https://example.com/docs");
```

Only `http://` and `https://` URLs are permitted. Supplying another scheme (`ftp://`, `file://`, `javascript:`, etc.) results in a synchronous `TypeError` and the navigation request is blocked before reaching the main process.

## 🎭 Event System & Real-time Updates

### TypedEventBus Architecture

The application uses a sophisticated event system for real-time communication:

```text
┌─────────────────────────┐
│   Service Layer         │ ← Emits domain events
├─────────────────────────┤
│   TypedEventBus         │ ← Type-safe event routing
├─────────────────────────┤
│   IPC Event Forwarding  │ ← Automatic frontend forwarding
├─────────────────────────┤
│   window.electronAPI    │ ← Event listeners in renderer
├─────────────────────────┤
│   Zustand Stores        │ ← State updates from events
├─────────────────────────┤
│   React Components      │ ← UI re-renders from state
└─────────────────────────┘
```

### Event Listener Registration

Realtime listeners exposed via the renderer `EventsService` focus on monitoring, cache invalidation, update status, and diagnostic test events. These helpers use `getIpcServiceHelpers("EventsService")` against the typed `events` preload domain so UI code never talks to `window.electronAPI.events` directly, while still ensuring consistent cleanup semantics:

```typescript
import { EventsService } from "../services/EventsService";

const cleanupFunctions: Array<() => void> = [];

cleanupFunctions.push(
 await EventsService.onCacheInvalidated((data) => {
  console.log(`Cache invalidated: ${data.type} → ${data.reason}`);
 })
);

cleanupFunctions.push(
 await EventsService.onMonitorStatusChanged((update) => {
  sitesStore.updateMonitorStatus(update.monitorId, update.status);
 })
);

// `update` adheres to the shared StatusUpdate contract (see shared/types.ts)

cleanupFunctions.push(
 await EventsService.onMonitoringStarted((info) => {
  console.log(`Monitoring resumed for ${info.monitorCount} monitors`);
 })
);

cleanupFunctions.push(
 await EventsService.onUpdateStatus((event) => {
  console.log(`Updater status: ${event.status}`);
 })
);

// Remember to clean up listeners
const cleanup = () => {
 for (const unsubscribe of cleanupFunctions) {
  unsubscribe();
 }
};
```

State synchronization events are delivered via the dedicated `StateSyncService`:

```typescript
import { StateSyncService } from "../services/StateSyncService";

const cleanupSync = await StateSyncService.onStateSyncEvent((event) => {
 switch (event.action) {
  case "bulk-sync":
   sitesStore.setSites(event.sites);
   break;
  case "update":
  case "delete":
   sitesStore.setSites(event.sites);
   break;
 }
});

// Later
cleanup();
cleanupSync();
```

### Event Types with Metadata

All events include automatic metadata injection:

```typescript
interface EventMetadata {
 busId: string; // Event bus identifier
 correlationId: string; // Unique ID for tracing
 eventName: string; // Name of the emitted event
 timestamp: number; // Event emission time (ms since epoch)
}

interface SiteAddedEvent {
 site: Site;
 source: "import" | "migration" | "user";
 timestamp: number;
 // Automatic metadata is available at runtime via the non-enumerable `event._meta` property.
 // Note: `event._meta.timestamp` is the emission timestamp; payload `timestamp` may be captured earlier.
}
```

### Backend Event Emission

Events are emitted from service managers using TypedEventBus:

```typescript
// In SiteManager service
export class SiteManager {
 async createSite(data: SiteCreationData): Promise<Site> {
  const site = await this.siteRepository.create(data);

  await this.eventEmitter.emitTyped("internal:site:added", {
   identifier: site.identifier,
   operation: "added",
   site,
   timestamp: Date.now(),
  });

  return site;
 }
}
```

The `UptimeOrchestrator` listens for these internal events and re-broadcasts sanitized `site:*` topics (for example, `site:added`, `site:updated`) after stripping metadata. This keeps managers isolated from renderer-facing payloads while preserving a clear layering contract.

## 🎭 Event System

### TypedEventBus

Internal event communication uses a type-safe event bus with automatic metadata injection.

### Event Types

#### Site Events

```typescript
interface UptimeEvents {
 "site:added": {
  site: Site;
  source: "import" | "migration" | "user";
  timestamp: number;
 };
 "site:removed": {
  cascade: boolean;
  siteIdentifier: string;
  siteName: string;
  timestamp: number;
 };
 "site:updated": {
  previousSite: Site;
  site: Site;
  timestamp: number;
  updatedFields: string[];
 };
 "sites:state-synchronized": StateSyncEventData;
}

// Renderer-facing broadcast:
// - IPC channel: `state-sync-event` (see `shared/ipc/rendererEvents.ts`)
// - Payload: `StateSyncEventData`
```

> **Historical note:** Prior to the bridge refactor, managers emitted `site:cache-miss` and `site:cache-updated`. These topics have been fully removed from the public API--cache telemetry now flows exclusively through the internal equivalents (`internal:site:cache-miss` / `internal:site:cache-updated`), and the orchestrator emits `cache:invalidated` when the renderer must react.

#### Monitor Events

```typescript
interface UptimeEvents {
 "monitor:status-changed": StatusUpdate;
 "monitor:check-completed": {
  checkType: "manual" | "scheduled";
  monitorId: string;
  result: StatusUpdate;
  siteIdentifier: string;
  timestamp: number;
 };
 "monitor:down": MonitorDownEventData; // StatusUpdate payload + monitor/site context
 "monitor:up": MonitorUpEventData; // StatusUpdate payload + monitor/site context
}
```

Monitor lifecycle events (`monitor:down`/`monitor:up`) reuse the shared
`StatusUpdate` payload. `StatusUpdate.timestamp` is an ISO-8601 timestamp
string, while wrapper events such as `monitor:check-completed` include their
own `timestamp: number` field (milliseconds since epoch) for event ordering.

#### Internal Main-Process Events

The main process uses a typed event bus for internal orchestration. These event
names are **not** renderer-facing IPC broadcasts.

Examples (see `electron/events/eventTypes.ts`):

```typescript
interface InternalUptimeEvents {
 "internal:database:initialized": {
  operation: "initialized";
  success: boolean;
  timestamp: number;
 };

 "internal:database:history-limit-updated": {
  limit: number;
  operation: "history-limit-updated";
  timestamp: number;
 };
}
```

Renderer consumers subscribe to the corresponding broadcast events via
`EventsService` (for example, `settings:history-limit-updated`).

### Event Listening (Backend Only)

```typescript
// In Electron main process services
eventBus.onTyped("site:added", (data) => {
 console.log(`Site added from ${data.source} workflow: ${data.site.name}`);
 // Automatically includes correlation ID and metadata
});

// Emit events
await eventBus.emitTyped("site:added", {
 site: newSite,
 source: "user",
 timestamp: Date.now(),
});
```

## 🔗 Frontend Integration Patterns

### React Component Integration

```typescript
import { SiteService } from "../services/SiteService";
import { useSitesStore } from "../stores/useSitesStore";

function SiteManager() {
 const { sites, addSite, updateSite, removeSite, startMonitoring, isLoading } =
  useSitesStore();

 // Optimistic updates with error handling
 const handleCreateSite = async (siteData: SiteCreationData) => {
  try {
   // Optimistic update to UI
   const optimisticSite = {
    ...siteData,
    identifier: "temp-identifier",
   };
   addSite(optimisticSite);

   // Call backend
   const newSite = await SiteService.addSite(siteData);

   // Replace optimistic entry with real data
   updateSite("temp-identifier", newSite);
  } catch (error) {
   // Rollback optimistic update
   removeSite("temp-identifier");
   console.error("Failed to create site:", error);
  }
 };

 return (
  <div>
   {sites.map((site) => (
    <SiteCard
     key={site.identifier}
     site={site}
     onStartMonitoring={() => startMonitoring(site.identifier)}
    />
   ))}
  </div>
 );
}
```

### Store Integration with Event Listeners

```typescript
import { create } from "zustand";
import { useEffect } from "react";
import { SiteService } from "../services/SiteService";
import { StateSyncService } from "../services/StateSyncService";
// Zustand store with comprehensive IPC and event integration
export const useSitesStore = create<SitesStore>()((set, get) => ({
 sites: [],
 isLoading: false,
 lastSyncTime: null,
 // State actions
 setSites: (sites: Site[]) => set({ sites }),
 addSite: (site: Site) =>
  set((state) => ({
   sites: [...state.sites, site],
  })),

 // Operations actions
 fetchSites: async () => {
  set({ isLoading: true });
  try {
   const sites = await SiteService.getSites();
   set({ sites, lastSyncTime: Date.now() });
  } catch (error) {
   console.error("Failed to fetch sites:", error);
  } finally {
   set({ isLoading: false });
  }
 },

 createSite: async (siteData: SiteCreationData) => {
  const newSite = await SiteService.addSite(siteData);
  // Don't manually add - event listener will handle it
  return newSite;
 },

 // Event-driven sync (called by event listeners)
 syncFromBackend: async () => {
  const { sites } = await StateSyncService.requestFullSync();
  set({ sites, lastSyncTime: Date.now() });
 },
}));

// Setup event listeners (typically in root component or hook)
export const useSiteEventListeners = () => {
 const syncFromBackend = useSitesStore((state) => state.syncFromBackend);

 useEffect(() => {
  let disposed = false;

  const setup = async () => {
   const cleanup = await StateSyncService.onStateSyncEvent((event) => {
    if (disposed) {
     return;
    }

    switch (event.action) {
     case "bulk-sync":
      syncFromBackend();
      break;
     case "update":
     case "delete":
      useSitesStore.getState().setSites(event.sites);
      break;
    }
   });

   return cleanup;
  };

  const subscriptionPromise = setup();

  return () => {
   disposed = true;
   subscriptionPromise.then((cleanup) => cleanup?.()).catch(console.error);
  };
 }, [syncFromBackend]);
};
```

### Custom Hooks for IPC Operations

```typescript
import { SiteService } from "../services/SiteService";

// Custom hook for site operations with loading states
export const useSiteOperations = () => {
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const createSite = useCallback(async (siteData: SiteCreationData) => {
  setIsLoading(true);
  setError(null);

  try {
   const newSite = await SiteService.addSite(siteData);
   return newSite;
  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : "Unknown error";
   setError(errorMessage);
   throw err;
  } finally {
   setIsLoading(false);
  }
 }, []);

 const deleteSite = useCallback(async (siteIdentifier: string) => {
  setIsLoading(true);
  setError(null);

  try {
   await SiteService.removeSite(siteIdentifier);
  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : "Unknown error";
   setError(errorMessage);
   throw err;
  } finally {
   setIsLoading(false);
  }
 }, []);

 return {
  createSite,
  deleteSite,
  isLoading,
  error,
  clearError: () => setError(null),
 };
};
```

## 📊 Data Types Reference

### Core Interfaces

#### Site

```typescript
interface Site {
 identifier: string;
 name: string;
 url: string;
 description?: string;
 tags: string[];
 monitoring: boolean;
 monitors: Monitor[];
 createdAt: number;
 updatedAt: number;
}
```

#### Monitor

```typescript
interface Monitor {
 id: string;
 type: "http" | "port" | "ping";
 siteIdentifier: string;
 checkInterval: number; // milliseconds
 retryAttempts: number;
 timeout: number; // milliseconds
 config: HttpMonitorConfig | PortMonitorConfig | PingMonitorConfig;
 lastResult?: MonitorCheckResult;
 createdAt: number;
 updatedAt: number;
}
```

#### MonitorCheckResult

```typescript
interface MonitorCheckResult {
 status: "up" | "down";
 responseTime: number; // milliseconds
 details?: string; // Human-readable details
 error?: string; // Technical error message
}
```

#### HistoryEntry

```typescript
interface HistoryEntry {
 id: string;
 monitorId: string;
 timestamp: number;
 status: "up" | "down";
 responseTime: number;
 details?: string;
 error?: string;
}
```

### Monitor Type Configurations

Monitor configuration is represented by the shared {@link Monitor} domain model
(defined in [`shared/types.ts`](../../shared/types.ts)). Instead of maintaining
separate per-type config interfaces, the `Monitor` model uses a discriminating
`type` field plus optional, type-specific properties.

The authoritative runtime validation for those properties lives in the shared
Zod schema graph:

- Monitor schemas: [`shared/validation/monitorSchemas.ts`](../../shared/validation/monitorSchemas.ts)
- Field primitives (IDs, URL/host constraints, etc.): [`shared/validation/monitorFieldSchemas.ts`](../../shared/validation/monitorFieldSchemas.ts)

For an IPC-backed validation entry point, use
`MonitorTypesService.validateMonitorData(...)` (documented above) which mirrors
the backend validation layer.

| Monitor type (`Monitor.type`) | Primary fields on {@link Monitor} |
| --- | --- |
| `http` | `url`, `checkInterval`, optional `followRedirects` |
| `http-status` | `url`, `expectedStatusCode` |
| `http-header` | `url`, `headerName`, `expectedHeaderValue` |
| `http-keyword` | `url`, `bodyKeyword` |
| `http-json` | `url`, `expectedJsonValue` |
| `http-latency` | `url` |
| `ping` | `host` |
| `port` | `host`, `port` |
| `dns` | `host`, `expectedValue` |
| `ssl` | `host`, `port`, `certificateWarningDays` |
| `cdn-edge-consistency` | `baselineUrl`, `edgeLocations` |
| `replication` | replication URLs + lag budget fields (see schema) |
| `server-heartbeat` | heartbeat URLs + drift budget fields (see schema) |
| `websocket-keepalive` | websocket URL + timeout fields (see schema) |

> **Schema note:** The table above is intentionally high level. Refer to the
> shared Zod schemas for the exact required fields and constraints per monitor
> type.

## 🛠️ Error Handling

### IPC Error Responses

All IPC calls include consistent error handling:

```typescript
import { SiteService } from "../services/SiteService";

try {
 const site = await SiteService.addSite(siteData);
} catch (error) {
 // Error includes:
 // - message: Human-readable error message
 // - code: Error code for programmatic handling
 // - details: Additional context (development only)
 console.error("Site creation failed:", error.message);
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource doesn't exist
- `ALREADY_EXISTS`: Duplicate resource
- `DATABASE_ERROR`: Database operation failed
- `NETWORK_ERROR`: Network request failed
- `PERMISSION_DENIED`: Insufficient permissions

## 🔒 Security

### Context Isolation

All IPC communication uses Electron's context isolation and the typed preload
bridge for security:

```typescript
// electron/preload.ts - Secure exposure
import type { ElectronBridgeApi } from "@shared/types/preload";
import { contextBridge } from "electron";

import { dataApi } from "./preload/domains/dataApi";
import { monitoringApi } from "./preload/domains/monitoringApi";
import { monitorTypesApi } from "./preload/domains/monitorTypesApi";
import { notificationsApi } from "./preload/domains/notificationsApi";
import { settingsApi } from "./preload/domains/settingsApi";
import { sitesApi } from "./preload/domains/sitesApi";
import { stateSyncApi } from "./preload/domains/stateSyncApi";
import { systemApi } from "./preload/domains/systemApi";
import { createEventsApi } from "./preload/domains/eventsApi";

const electronAPI: ElectronBridgeApi<
 ReturnType<typeof createEventsApi>,
 typeof systemApi
> = {
 data: dataApi,
 events: createEventsApi(),
 monitoring: monitoringApi,
 monitorTypes: monitorTypesApi,
 notifications: notificationsApi,
 settings: settingsApi,
 sites: sitesApi,
 stateSync: stateSyncApi,
 system: systemApi,
} as const;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

### Validation

All IPC handlers include input validation:

```typescript
// Backend handler with validation (electron/services/ipc/handlers/siteHandlers.ts)
import { SITES_CHANNELS } from "@shared/types/preload";

import { registerStandardizedIpcHandler } from "./utils";
import { SiteHandlerValidators } from "./validators";

registerStandardizedIpcHandler(
 SITES_CHANNELS.addSite,
 withIgnoredIpcEvent((site) => uptimeOrchestrator.addSite(site)),
 SiteHandlerValidators.addSite,
 registeredHandlers
);
```

## 📝 Adding New APIs

### 1\. Define Types

```typescript
// shared/types/apiTypes.ts
export interface NewFeatureData {
 name: string;
 config: NewFeatureConfig;
}
```

### 2\. Create IPC Handler

```typescript
// electron/services/ipc/handlers/featureHandlers.ts (conceptual)
import { FEATURE_CHANNELS } from "@shared/types/preload";

import { registerStandardizedIpcHandler } from "../utils";

registerStandardizedIpcHandler(
 FEATURE_CHANNELS.createFeature,
 withIgnoredIpcEvent((data: NewFeatureData) => featureManager.create(data)),
 isNewFeatureData,
 registeredHandlers
);
```

### 3\. Expose in Preload

```typescript
// electron/preload/domains/featureApi.ts (conceptual)
import { FEATURE_CHANNELS } from "@shared/types/preload";
import { createTypedInvoker } from "./core/bridgeFactory";

export function createFeatureApi() {
 return {
  create: createTypedInvoker(FEATURE_CHANNELS.createFeature),
 };
}
```

### 4\. Use in Frontend

```typescript
// src/components/FeatureComponent.tsx
import { FeatureService } from "../services/FeatureService";

const newFeature = await FeatureService.create(featureData);
```

---

💡 **Best Practices**: Always use TypeScript interfaces, validate inputs, handle errors gracefully, and follow the verb-first hyphenated naming convention (`create-feature`, `get-sites`).
````
