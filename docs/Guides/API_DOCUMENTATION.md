# 📡 API & IPC Documentation

> **Interface Reference**: Comprehensive guide to IPC communication, events, and API patterns in Uptime Watcher.

## 📋 Overview

Uptime Watcher uses type-safe IPC (Inter-Process Communication) between the Electron main process and React renderer, along with an event-driven architecture for internal communication.

## 🔌 IPC Communication

### Access Pattern

Renderer code should consume the typed service layer under `src/services` rather than calling `window.electronAPI` directly. These helpers wait for the preload bridge, apply validation, and centralize error reporting.

```typescript
import { SiteService } from "src/services/SiteService";
import { MonitoringService } from "src/services/MonitoringService";
import { StateSyncService } from "src/services/StateSyncService";

const sites = await SiteService.getSites();
const createdSite = await SiteService.addSite(siteData);
await MonitoringService.startMonitoring();
const syncResult = await StateSyncService.requestFullSync();
```

> ℹ️ **Low-level bridge**: The examples below describe the underlying `window.electronAPI` contract for completeness. New renderer code must route through the service modules shown above to preserve telemetry, validation, and compatibility guarantees.

### Domain-Based API Organization

The `window.electronAPI` is organized into focused domains:

```typescript
import type { ElectronBridgeApi } from "@shared/types/preload";

import type { EventsApi } from "./preload/domains/eventsApi";
import type { SystemApi } from "./preload/domains/systemApi";

import { dataApi } from "./preload/domains/dataApi";
import { createEventsApi } from "./preload/domains/eventsApi";
import { monitoringApi } from "./preload/domains/monitoringApi";
import { monitorTypesApi } from "./preload/domains/monitorTypesApi";
import { settingsApi } from "./preload/domains/settingsApi";
import { sitesApi } from "./preload/domains/sitesApi";
import { stateSyncApi } from "./preload/domains/stateSyncApi";
import { systemApi } from "./preload/domains/systemApi";

type ElectronAPI = ElectronBridgeApi<EventsApi, SystemApi>;

const electronAPI: ElectronAPI = {
 data: dataApi,
 events: createEventsApi(),
 monitoring: monitoringApi,
 monitorTypes: monitorTypesApi,
 settings: settingsApi,
 sites: sitesApi,
 stateSync: stateSyncApi,
 system: systemApi,
};
```

### Type Safety and Validation

All IPC calls are fully typed with TypeScript interfaces and validated at the IPC boundary:

```typescript
// Backend: IPC handler with validation
registerStandardizedIpcHandler(
  "add-site",
  async (site: Site): Promise<Site> => {
    return await this.uptimeOrchestrator.addSite(site);
  },
  // Validation function ensures type safety
  SiteHandlerValidators.addSite
);

// Frontend: Type-safe calls with automatic inference
const newSite: Site = await SiteService.addSite({
  name: "Example Site",
  url: "https://example.com",
  monitors: [...]
});
```

## 🗂️ IPC API Reference

### Sites API (`SiteService`)

> Primary entry point: `src/services/SiteService`. Under the hood this wraps `window.electronAPI.sites`.

#### `getSites(): Promise<Site[]>`

Retrieves all configured sites with their monitors.

```typescript
const sites = await SiteService.getSites();
// Returns: Site[] with complete monitor configurations
```

#### `addSite(site: Site): Promise<Site>`

Creates a new site (and its monitors) using the transactional repository
pipeline. The backend emits a `site:added` renderer event upon success.

```typescript
const newSite = await SiteService.addSite({
 identifier: "site-001",
 name: "My Website",
 url: "https://mywebsite.com",
 description: "Production website monitoring",
 monitoring: true,
 monitors: [
  {
   id: "monitor-001",
   type: "http",
   monitoring: true,
   config: {
    url: "https://mywebsite.com",
    method: "GET",
    timeout: 10000,
    checkInterval: 30000,
    retryAttempts: 3,
   },
  },
 ],
});
```

#### `updateSite(identifier: string, updates: Partial<Site>): Promise<Site>`

Updates an existing site and/or its monitors. The backend broadcasts
`site:updated` with the new snapshot and list of changed fields.

```typescript
const updatedSite = await SiteService.updateSite(siteIdentifier, {
 name: "New Site Name",
 description: "Updated description",
});
```

#### `removeSite(identifier: string): Promise<boolean>`

Deletes a site together with its monitors and history. Returns `true` on
success and emits a `site:removed` event once cleanup is complete.

```typescript
const removed = await SiteService.removeSite(siteIdentifier);
if (removed) {
 console.info(`Site ${siteIdentifier} removed`);
}
```

#### `removeMonitor(siteIdentifier: string, monitorId: string): Promise<Site>`

Removes a single monitor from a site and returns the updated site snapshot.

```typescript
const updatedSite = await SiteService.removeMonitor(siteIdentifier, monitorId);
```

#### `deleteAllSites(): Promise<number>`

Dangerous operation intended for test utilities. Removes every site in the
database and returns the number of deleted records. Use with extreme caution.

### Monitoring API (`MonitoringService`)

> Primary entry point: `src/services/MonitoringService`. Internally this interacts with `window.electronAPI.monitoring`.

#### `checkSiteNow(siteIdentifier: string, monitorId: string): Promise<StatusUpdate | undefined>`

Performs a manual health check for a specific monitor and returns the most
recent `StatusUpdate` when available.

```typescript
const result = await MonitoringService.checkSiteNow(siteIdentifier, monitorId);
if (result) {
 console.log(`Manual check completed at ${new Date(result.timestamp)}`);
}
```

#### `startMonitoring(): Promise<boolean>`

Starts monitoring for every configured site. Resolves to `true` when the
backend accepts the request and emits `monitoring:started`.

```typescript
const started = await MonitoringService.startMonitoring();
```

#### `stopMonitoring(): Promise<boolean>`

Stops all active monitors. Resolves to `true` when monitoring halts and
emits `monitoring:stopped`.

```typescript
const stopped = await MonitoringService.stopMonitoring();
```

#### `startMonitoringForMonitor(siteIdentifier: string, monitorId: string): Promise<boolean>`

Starts monitoring for a specific monitor belonging to the given site. Emits the
standard monitoring lifecycle and cache invalidation events when successful.

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

Validates monitor configuration against type-specific schemas.

```typescript
const validation = await MonitorTypesService.validateMonitorData("http", {
 url: "https://example.com",
 timeout: 5000,
});
// Returns: { isValid: boolean, errors?: string[] }
```

#### `formatMonitorDetail(type: string, detail: string): Promise<string>`

Applies monitor-specific formatting to detail strings in the renderer UI.

#### `formatMonitorTitleSuffix(type: string, monitor: Monitor): Promise<string>`

Returns a human-friendly suffix for monitor titles (e.g., HTTP method or host
name).

### Data API (`DataService`)

> Primary entry point: `src/services/DataService`. Internally this wraps `window.electronAPI.data`.

#### `exportData(): Promise<string>`

Exports the full application dataset (sites, monitors, history snapshots, and
settings) as a JSON string.

```typescript
const payload = await DataService.exportData();
const snapshot = JSON.parse(payload);
```

#### `importData(serialized: string): Promise<boolean>`

Imports a previously exported dataset. The argument must be the raw JSON string
produced by `exportData()`.

```typescript
const success = await DataService.importData(payload);
if (!success) {
 notify("Import reported validation failures");
}
```

#### `downloadSqliteBackup(): Promise<SerializedDatabaseBackupResult>`

Generates a SQLite database backup and returns a transferable payload
containing the binary buffer, file metadata, and the suggested download file
name.

```typescript
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

const backup: SerializedDatabaseBackupResult =
 await DataService.downloadSqliteBackup();

await handleSQLiteBackupDownload(async () => backup);
// Downloads `backup.fileName` using the ArrayBuffer payload.
```

> The renderer receives an `ArrayBuffer`, ensuring compatibility with browser
> APIs without leaking Node.js `Buffer` instances. Additional metadata (size,
> creation timestamp, and original on-disk location) can be used for analytics
> or audit logging.

### Monitor Types API (`MonitorTypesService`)

> Primary entry point: `src/services/MonitorTypesService`. Internally this wraps `window.electronAPI.monitorTypes`.

#### `getMonitorTypes(): Promise<MonitorTypeConfig[]>`

Retrieves the full registry of available monitor types, including validation
metadata and editor hints.

```typescript
const monitorTypes = await MonitorTypesService.getMonitorTypes();
// Returns serialized configurations (no prototype functions)
```

### Settings API (`SettingsService`)

> Primary entry point: `src/services/SettingsService`. Internally this wraps `window.electronAPI.settings`.

#### `getHistoryLimit(): Promise<number>`

Retrieves the current history retention limit (in days).

```typescript
const limit = await SettingsService.getHistoryLimit();
```

#### `resetSettings(): Promise<void>`

Restores application settings to their factory defaults while leaving domain
state untouched (sites, monitors, and history remain intact).

```typescript
await SettingsService.resetSettings();
```

#### `updateHistoryLimit(limitDays: number): Promise<number>`

Sets the history retention limit and returns the persisted value.

```typescript
const updatedLimit = await SettingsService.updateHistoryLimit(45);
```

### State Sync API (`StateSyncService`)

> Primary entry point: `src/services/StateSyncService`. Internally this wraps `window.electronAPI.stateSync`.

#### `getSyncStatus(): Promise<StateSyncStatusSummary>`

Retrieves the latest synchronization status snapshot, including last sync time, site count, and origin.

```typescript
const status = await StateSyncService.getSyncStatus();
console.log(`Last sync: ${status.lastSyncAt}`);
```

#### `requestFullSync(): Promise<StateSyncFullSyncResult>`

Performs a full synchronization round-trip and returns the authoritative site snapshot. The call also emits a `sites:state-synchronized` event to all renderers.

```typescript
const { sites } = await StateSyncService.requestFullSync();
useSitesStore.getState().setSites(sites);
```

#### `onStateSyncEvent(callback: (event: StateSyncEventData) => void): () => void`

Registers a listener for incremental state sync events (bulk-sync, update, delete). Returns a cleanup function to unsubscribe.

```typescript
const cleanup = await StateSyncService.onStateSyncEvent((event) => {
 if (event.action === "bulk-sync") {
  useSitesStore.getState().setSites(event.sites);
 }
});

// Later: cleanup();
```

### System API (`window.electronAPI.system`)

#### `openExternal(url: string): Promise<boolean>`

Opens HTTP(S) URLs in the user's default external browser. The call resolves
to `true` when Electron successfully delegates the navigation request.

> **Recommendation:** Access this capability through the renderer
> `SystemService` (`@app/services/SystemService`) rather than using the raw
> preload bridge. The service enforces URL validation, logging, and consistent
> error reporting.

```typescript
import { SystemService } from "@app/services/SystemService";

await SystemService.openExternal("https://example.com/docs");
```

Only `http://` and `https://` URLs are permitted. Supplying another scheme
(`ftp://`, `file://`, `javascript:`, etc.) results in a synchronous `TypeError`
and the navigation request is blocked before reaching the main process.

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

Realtime listeners exposed via `window.electronAPI.events` focus on monitoring, cache invalidation, update status, and diagnostic test events:

```typescript
const cleanupFunctions: Array<() => void> = [];

cleanupFunctions.push(
 await window.electronAPI.events.onCacheInvalidated((data) => {
  console.log(`Cache invalidated: ${data.type} → ${data.reason}`);
 })
);

cleanupFunctions.push(
 await window.electronAPI.events.onMonitorStatusChanged((update) => {
  sitesStore.updateMonitorStatus(update.monitorId, update.status);
 })
);

// `update` adheres to the shared StatusUpdate contract (see shared/types.ts)

cleanupFunctions.push(
 await window.electronAPI.events.onMonitoringStarted((info) => {
  console.log(`Monitoring resumed for ${info.monitorCount} monitors`);
 })
);

cleanupFunctions.push(
 await window.electronAPI.events.onUpdateStatus((event) => {
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

State synchronization events are delivered via the dedicated `stateSync` domain:

```typescript
const cleanupSync = await window.electronAPI.stateSync.onStateSyncEvent(
 (event) => {
  switch (event.action) {
   case "bulk-sync":
    sitesStore.setSites(event.sites);
    break;
   case "update":
   case "delete":
    sitesStore.setSites(event.sites);
    break;
  }
 }
);

// Later
cleanup();
cleanupSync();
```

### Event Types with Metadata

All events include automatic metadata injection:

```typescript
interface EventMetadata {
 correlationId: string; // Unique ID for tracing
 timestamp: number; // Event emission time
 source: string; // Service that emitted the event
}

interface SiteAddedEvent {
 site: Site;
 timestamp: number;
 // Automatic metadata is available but not in the interface
 // Access via event._meta property
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

The `UptimeOrchestrator` listens for these internal events and re-broadcasts
sanitized `site:*` topics (for example, `site:added`, `site:updated`) after
stripping metadata. This keeps managers isolated from renderer-facing payloads
while preserving a clear layering contract.

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
 "sites:state-synchronized": {
  action: "bulk-sync" | "delete" | "update";
  siteIdentifier?: string;
  sites: Site[];
  source: "cache" | "database" | "frontend";
  timestamp: number;
 };
}
```

> **Historical note:** Prior to the bridge refactor, managers emitted
> `site:cache-miss` and `site:cache-updated`. These topics have been fully
> removed from the public API—cache telemetry now flows exclusively through the
> internal equivalents (`internal:site:cache-miss` /
> `internal:site:cache-updated`), and the orchestrator emits `cache:invalidated`
> when the renderer must react.

#### Monitor Events

```typescript
interface UptimeEvents {
 "monitor:status-changed": {
  monitorId: string;
  siteIdentifier: string;
  status: MonitorStatus;
  previousStatus?: MonitorStatus;
  responseTime?: number;
  details?: string;
  timestamp: string; // ISO-8601
  monitor?: Monitor;
  site?: Site;
 };
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

Monitor lifecycle events (`monitor:down`/`monitor:up`) reuse the shared `StatusUpdate`
payload, so every downstream consumer sees the canonical `siteIdentifier`, `monitorId`,
and ISO-8601 `timestamp` values alongside populated `monitor` and `site` context.

#### Application Events

```typescript
interface UptimeEvents {
 "app:ready": { timestamp: number };
 "app:before-quit": { timestamp: number };
 "database:initialized": { timestamp: number };
 "settings:updated": { settings: AppSettings; timestamp: number };
}
```

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
import { useSitesStore } from "../stores/useSitesStore";

function SiteManager() {
  const {
    sites,
    addSite,
    updateSite,
    removeSite,
    startMonitoring,
    isLoading
  } = useSitesStore();

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
      const newSite = await window.electronAPI.sites.addSite(siteData);

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
          onStartMonitoring={() =>
            startMonitoring(site.identifier)
          }
        />
      ))}
    </div>
  );
}
```

### Store Integration with Event Listeners

````typescript
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
  const sites = await window.electronAPI.sites.getSites();
   set({ sites, lastSyncTime: Date.now() });
  } catch (error) {
   console.error("Failed to fetch sites:", error);
  } finally {
   set({ isLoading: false });
  }
 },

 createSite: async (siteData: SiteCreationData) => {
  const newSite = await window.electronAPI.sites.addSite(siteData);
  // Don't manually add - event listener will handle it
  return newSite;
 },

 // Event-driven sync (called by event listeners)
 syncFromBackend: async () => {
  const { sites } = await window.electronAPI.stateSync.requestFullSync();
  set({ sites, lastSyncTime: Date.now() });
 },
}));

// Setup event listeners (typically in root component or hook)
export const useSiteEventListeners = () => {
 const syncFromBackend = useSitesStore((state) => state.syncFromBackend);

 useEffect(() => {
  let disposed = false;

  const setup = async () => {
   const cleanup = await window.electronAPI.stateSync.onStateSyncEvent(
    (event) => {
     if (disposed) {
      return;
     }

     switch (event.action) {

    ### Site lifecycle subscriptions via `EventsService`

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
      }, [addSite, updateSite, removeSite]);
    }
    ```
      case "bulk-sync":
       syncFromBackend();
       break;
      case "update":
      case "delete":
       useSitesStore.getState().setSites(event.sites);
       break;
     }
    }
   );

   return cleanup;
  };

  const subscriptionPromise = setup();

  return () => {
   disposed = true;
   subscriptionPromise.then((cleanup) => cleanup?.()).catch(console.error);
  };
 }, [syncFromBackend]);
};
````

### Custom Hooks for IPC Operations

```typescript
// Custom hook for site operations with loading states
export const useSiteOperations = () => {
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const createSite = useCallback(async (siteData: SiteCreationData) => {
  setIsLoading(true);
  setError(null);

  try {
   const newSite = await window.electronAPI.sites.addSite(siteData);
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
   await window.electronAPI.sites.removeSite(siteIdentifier);
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

Every monitor configuration extends `BaseMonitorConfig` and adds type-specific fields. The full set of interfaces lives in [`shared/types/monitorConfig.ts`](../../shared/types/monitorConfig.ts) and is surfaced to both the Electron backend and the renderer through IPC.

```typescript
type MonitorConfig =
 | HttpMonitorConfig
 | HttpStatusMonitorConfig
 | HttpHeaderMonitorConfig
 | HttpKeywordMonitorConfig
 | HttpJsonMonitorConfig
 | HttpLatencyMonitorConfig
 | PingMonitorConfig
 | PortMonitorConfig
 | DnsMonitorConfig
 | SslMonitorConfig
 | CdnEdgeConsistencyMonitorConfig
 | ReplicationMonitorConfig
 | ServerHeartbeatMonitorConfig
 | WebsocketKeepaliveMonitorConfig;
```

| Monitor type (`type` field) | Configuration interface           | Key fields                                                                                                      |
| --------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `http`                      | `HttpMonitorConfig`               | `url`, `method`, `expectedStatusCodes`, optional `auth`/`headers`/`requestBody`                                 |
| `http-status`               | `HttpStatusMonitorConfig`         | `url`, `expectedStatusCode`                                                                                     |
| `http-header`               | `HttpHeaderMonitorConfig`         | `url`, `headerName`, `expectedHeaderValue`                                                                      |
| `http-keyword`              | `HttpKeywordMonitorConfig`        | `url`, `bodyKeyword`                                                                                            |
| `http-json`                 | `HttpJsonMonitorConfig`           | `url`, `jsonPath`, `expectedJsonValue`                                                                          |
| `http-latency`              | `HttpLatencyMonitorConfig`        | `url`, `maxResponseTime`                                                                                        |
| `ping`                      | `PingMonitorConfig`               | `host`, `packetCount`, `packetSize`, optional `maxPacketLoss`                                                   |
| `port`                      | `PortMonitorConfig`               | `host`, `port`, optional `protocol.expectedResponse`/`useTls`                                                   |
| `dns`                       | `Monitor` domain fields           | `host`, `recordType`, optional `expectedValue`                                                                  |
| `ssl`                       | `SslMonitorConfig`                | `host`, `port`, `certificateWarningDays`                                                                        |
| `cdn-edge-consistency`      | `CdnEdgeConsistencyMonitorConfig` | `baselineUrl`, `edgeLocations` (newline or comma separated list)                                                |
| `replication`               | `ReplicationMonitorConfig`        | `primaryStatusUrl`, `replicaStatusUrl`, `replicationTimestampField`, `maxReplicationLagSeconds`                 |
| `server-heartbeat`          | `ServerHeartbeatMonitorConfig`    | `url`, `heartbeatStatusField`, `heartbeatExpectedStatus`, `heartbeatTimestampField`, `heartbeatMaxDriftSeconds` |
| `websocket-keepalive`       | `WebsocketKeepaliveMonitorConfig` | `url`, `maxPongDelayMs`                                                                                         |

All configuration interfaces also inherit scheduling, retry, and timeout controls from `BaseMonitorConfig`, ensuring consistent behaviour across the monitoring pipeline.

## 🛠️ Error Handling

### IPC Error Responses

All IPC calls include consistent error handling:

```typescript
try {
 const site = await window.electronAPI.sites.addSite(siteData);
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

All IPC communication uses Electron's context isolation for security:

```typescript
// preload.ts - Secure exposure
const electronAPI = {
 sites: {
  getSites: () => ipcRenderer.invoke("get-sites"),
  addSite: (data: SiteCreationData) => ipcRenderer.invoke("add-site", data),
  updateSite: (identifier: string, updates: Partial<Site>) =>
   ipcRenderer.invoke("update-site", identifier, updates),
  removeSite: (identifier: string) =>
   ipcRenderer.invoke("remove-site", identifier),
  removeMonitor: (identifier: string, monitorId: string) =>
   ipcRenderer.invoke("remove-monitor", identifier, monitorId),
  deleteAllSites: () => ipcRenderer.invoke("delete-all-sites"),
 },
} as const;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

### Validation

All IPC handlers include input validation:

```typescript
// Backend handler with validation
ipcService.registerStandardizedIpcHandler(
 "add-site",
 async (site: Site) => {
  return await uptimeOrchestrator.addSite(site);
 },
 SiteHandlerValidators.addSite
);
```

## 📝 Adding New APIs

### 1. Define Types

```typescript
// shared/types/apiTypes.ts
export interface NewFeatureData {
 name: string;
 config: NewFeatureConfig;
}
```

### 2. Create IPC Handler

```typescript
// electron/services/ipc/IpcService.ts
ipcService.registerStandardizedIpcHandler(
 "create-feature",
 async (data: NewFeatureData) => {
  return await featureManager.create(data);
 },
 isNewFeatureData
);
```

### 3. Expose in Preload

```typescript
// electron/preload.ts
const electronAPI = {
 // ... existing APIs
 feature: {
  create: (data: NewFeatureData) => ipcRenderer.invoke("create-feature", data),
 },
};
```

### 4. Use in Frontend

```typescript
// src/components/FeatureComponent.tsx
const newFeature = await window.electronAPI.feature.create(featureData);
```

---

💡 **Best Practices**: Always use TypeScript interfaces, validate inputs, handle errors gracefully, and follow the verb-first hyphenated naming convention (`create-feature`, `get-sites`).
