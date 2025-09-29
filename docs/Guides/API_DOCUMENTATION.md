# 📡 API & IPC Documentation

> **Interface Reference**: Comprehensive guide to IPC communication, events, and API patterns in Uptime Watcher.

## 📋 Overview

Uptime Watcher uses type-safe IPC (Inter-Process Communication) between the Electron main process and React renderer, along with an event-driven architecture for internal communication.

## 🔌 IPC Communication

### Access Pattern

All IPC communication goes through the preload-exposed `window.electronAPI` object with domain-based organization:

```typescript
// Available in renderer process (React components)
const result = await window.electronAPI.sites.getAll();
const site = await window.electronAPI.sites.create(siteData);
const settings = await window.electronAPI.settings.get();
const monitorTypes = await window.electronAPI.monitorTypes.getAll();
```

### Domain-Based API Organization

The `window.electronAPI` is organized into focused domains:

```typescript
interface ElectronAPI {
 /** Site management operations (CRUD, monitoring control) */
 sites: SitesAPI;
 /** Data management operations (import/export, settings, backup) */
 data: DataAPI;
 /** Event listener registration for various system events */
 events: EventsAPI;
 /** Monitoring control operations (start/stop, validation, formatting) */
 monitoring: MonitoringAPI;
 /** Monitor type registry operations */
 monitorTypes: MonitorTypesAPI;
 /** Settings management operations */
 settings: SettingsAPI;
 /** State synchronization operations */
 stateSync: StateSyncAPI;
 /** System-level operations (external links, etc.) */
 system: SystemAPI;
}
```

### Type Safety and Validation

All IPC calls are fully typed with TypeScript interfaces and validated at the IPC boundary:

```typescript
// Backend: IPC handler with validation
registerStandardizedIpcHandler(
  "sites:create",
  async (data: SiteCreationData): Promise<Site> => {
    // Business logic handled by service managers
    return await this.siteManager.createSite(data);
  },
  // Validation function ensures type safety
  (data): data is SiteCreationData =>
    siteCreationSchema.safeParse(data).success
);

// Frontend: Type-safe calls with automatic inference
const newSite: Site = await window.electronAPI.sites.create({
  name: "Example Site",
  url: "https://example.com",
  monitors: [...]
});
```

## 🗂️ IPC API Reference

### Sites API (`window.electronAPI.sites`)

#### `getAll(): Promise<Site[]>`

Retrieves all configured sites with their monitors.

```typescript
const sites = await window.electronAPI.sites.getAll();
// Returns: Site[] with complete monitor configurations
```

#### `create(data: SiteCreationData): Promise<Site>`

Creates a new site with associated monitors using transaction safety.

```typescript
const newSite = await window.electronAPI.sites.create({
 name: "My Website",
 url: "https://mywebsite.com",
 description: "Production website monitoring",
 monitors: [
  {
   type: "http",
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

#### `update(id: string, data: Partial<SiteUpdateData>): Promise<Site>`

Updates an existing site and/or its monitors.

```typescript
const updatedSite = await window.electronAPI.sites.update(siteId, {
 name: "New Site Name",
 description: "Updated description",
 monitors: [...updatedMonitors],
});
```

#### `delete(id: string): Promise<void>`

Deletes a site and all its associated monitors and historical data.

```typescript
await window.electronAPI.sites.delete(siteId);
// Triggers 'sites:deleted' event
```

#### `startMonitoring(id: string): Promise<void>`

Starts monitoring for all monitors associated with a site.

```typescript
await window.electronAPI.sites.startMonitoring(siteId);
// Triggers 'sites:monitoring-started' event
```

#### `stopMonitoring(id: string): Promise<void>`

Stops monitoring for all monitors associated with a site.

```typescript
await window.electronAPI.sites.stopMonitoring(siteId);
// Triggers 'sites:monitoring-stopped' event
```

### Monitoring API (`window.electronAPI.monitoring`)

#### `checkManually(siteId: string, monitorId: string): Promise<MonitorCheckResult>`

Performs a manual health check for a specific monitor.

```typescript
const result = await window.electronAPI.monitoring.checkManually(
 siteId,
 monitorId
);
// Returns: {
//   status: "up" | "down",
//   responseTime: number,
//   details?: string,
//   error?: string,
//   timestamp: number
// }
```

#### `validateMonitorConfig(config: MonitorConfig): Promise<ValidationResult>`

Validates monitor configuration against type-specific schemas.

```typescript
const validation = await window.electronAPI.monitoring.validateMonitorConfig({
 type: "http",
 config: { url: "https://example.com", timeout: 5000 },
});
// Returns: { isValid: boolean, errors?: string[] }
```

### Data API (`window.electronAPI.data`)

#### `exportData(options?: ExportOptions): Promise<ExportResult>`

Exports application data (sites, monitors, history, settings).

```typescript
const exportResult = await window.electronAPI.data.exportData({
 includeHistory: true,
 dateRange: { start: startDate, end: endDate },
 format: "json",
});
```

#### `importData(data: ImportData, options?: ImportOptions): Promise<ImportResult>`

Imports previously exported data with conflict resolution.

```typescript
const importResult = await window.electronAPI.data.importData(importData, {
 overwriteExisting: false,
 validateBeforeImport: true,
});
```

### Monitor Types API (`window.electronAPI.monitorTypes`)

#### `getAll(): Promise<MonitorTypeConfig[]>`

Retrieves all available monitor type configurations.

```typescript
const monitorTypes = await window.electronAPI.monitorTypes.getAll();
// Returns serialized configurations (no functions/schemas)
```

#### `getByType(type: string): Promise<MonitorTypeConfig | null>`

Retrieves configuration for a specific monitor type.

```typescript
const httpConfig = await window.electronAPI.monitorTypes.getByType("http");
```

### Settings API (`window.electronAPI.settings`)

#### `get(): Promise<AppSettings>`

Retrieves current application settings.

```typescript
const settings = await window.electronAPI.settings.get();
```

#### `update(data: Partial<AppSettings>): Promise<AppSettings>`

Updates application settings with validation.

```typescript
const updated = await window.electronAPI.settings.update({
 notifications: {
  enabled: true,
  onStatusChange: true,
  onFailure: true,
 },
 theme: "dark",
 monitoring: {
  defaultCheckInterval: 60000,
  maxRetryAttempts: 3,
 },
});
```

### State Sync API (`window.electronAPI.stateSync`)

#### `invalidateCache(keys: string[]): Promise<void>`

Invalidates specific cache keys to force data refresh.

```typescript
await window.electronAPI.stateSync.invalidateCache(["sites", "settings"]);
// Triggers cache refresh for specified domains
```

### System API (`window.electronAPI.system`)

#### `openExternal(url: string): Promise<void>`

Opens URLs in the default external browser.

```typescript
await window.electronAPI.system.openExternal("https://example.com");
```

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

All event listeners are accessed through `window.electronAPI.events`:

```typescript
// Site events
const cleanup1 = window.electronAPI.events.onSiteAdded((data) => {
 sitesStore.addSite(data.site);
 showNotification(`Site ${data.site.name} added`);
});

const cleanup2 = window.electronAPI.events.onSiteDeleted((data) => {
 sitesStore.removeSite(data.siteId);
});

// Monitor events
const cleanup3 = window.electronAPI.events.onMonitorStatusChanged((data) => {
 sitesStore.updateMonitorStatus(data.monitorId, data.newStatus);
 if (data.newStatus === "down") {
  showNotification(`Monitor ${data.monitorId} is down!`, "error");
 }
});

// Settings events
const cleanup4 = window.electronAPI.events.onSettingsUpdated((data) => {
 settingsStore.updateSettings(data.settings);
});

// Clean up listeners (important for preventing memory leaks)
useEffect(() => {
 return () => {
  cleanup1();
  cleanup2();
  cleanup3();
  cleanup4();
 };
}, []);
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

  // Emit typed event with automatic metadata injection
  await this.eventBus.emitTyped("sites:added", {
   site,
   timestamp: Date.now(),
  });

  return site;
 }
}
```

## 🎭 Event System

### TypedEventBus

Internal event communication uses a type-safe event bus with automatic metadata injection.

### Event Types

#### Site Events

```typescript
interface UptimeEvents {
 "sites:added": { site: Site; timestamp: number };
 "sites:updated": { site: Site; timestamp: number };
 "sites:deleted": { siteId: string; timestamp: number };
 "sites:monitoring-started": { siteId: string; timestamp: number };
 "sites:monitoring-stopped": { siteId: string; timestamp: number };
}
```

#### Monitor Events

```typescript
interface UptimeEvents {
 "monitor:status-changed": {
  monitorId: string;
  siteId: string;
  newStatus: "up" | "down";
  previousStatus: "up" | "down";
  responseTime: number;
  details?: string;
  timestamp: number;
 };
 "monitor:check-completed": {
  monitorId: string;
  siteId: string;
  result: MonitorCheckResult;
  timestamp: number;
 };
}
```

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
eventBus.onTyped("sites:added", (data) => {
 console.log(`Site added: ${data.site.name} at ${data.timestamp}`);
 // Automatically includes correlation ID and metadata
});

// Emit events
await eventBus.emitTyped("sites:added", {
 site: newSite,
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
      const optimisticSite = { ...siteData, id: 'temp-id' };
      addSite(optimisticSite);

      // Call backend
      const newSite = await window.electronAPI.sites.create(siteData);

      // Replace optimistic entry with real data
      updateSite('temp-id', newSite);
    } catch (error) {
      // Rollback optimistic update
      removeSite('temp-id');
      console.error("Failed to create site:", error);
    }
  };

  return (
    <div>
      {sites.map((site) => (
        <SiteCard
          key={site.id}
          site={site}
          onStartMonitoring={() => startMonitoring(site.id)}
        />
      ))}
    </div>
  );
}
```

### Store Integration with Event Listeners

```typescript
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
   const sites = await window.electronAPI.sites.getAll();
   set({ sites, lastSyncTime: Date.now() });
  } catch (error) {
   console.error("Failed to fetch sites:", error);
  } finally {
   set({ isLoading: false });
  }
 },

 createSite: async (siteData: SiteCreationData) => {
  const newSite = await window.electronAPI.sites.create(siteData);
  // Don't manually add - event listener will handle it
  return newSite;
 },

 // Event-driven sync (called by event listeners)
 syncFromBackend: async () => {
  const sites = await window.electronAPI.sites.getAll();
  set({ sites, lastSyncTime: Date.now() });
 },
}));

// Setup event listeners (typically in root component or hook)
export const useSiteEventListeners = () => {
 const syncFromBackend = useSitesStore((state) => state.syncFromBackend);
 const addSite = useSitesStore((state) => state.addSite);
 const removeSite = useSitesStore((state) => state.removeSite);

 useEffect(() => {
  const cleanupFunctions = [
   window.electronAPI.events.onSiteAdded((data) => {
    addSite(data.site);
   }),

   window.electronAPI.events.onSiteDeleted((data) => {
    removeSite(data.siteId);
   }),

   window.electronAPI.events.onSiteUpdated((data) => {
    // Full sync to ensure consistency
    syncFromBackend();
   }),
  ];

  return () => {
   cleanupFunctions.forEach((cleanup) => cleanup());
  };
 }, [syncFromBackend, addSite, removeSite]);
};
```

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
   const newSite = await window.electronAPI.sites.create(siteData);
   return newSite;
  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : "Unknown error";
   setError(errorMessage);
   throw err;
  } finally {
   setIsLoading(false);
  }
 }, []);

 const deleteSite = useCallback(async (siteId: string) => {
  setIsLoading(true);
  setError(null);

  try {
   await window.electronAPI.sites.delete(siteId);
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
 id: string;
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
 siteId: string;
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
 const site = await window.electronAPI.sites.create(siteData);
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
  getAll: () => ipcRenderer.invoke("sites:get-all"),
  create: (data: SiteCreationData) => ipcRenderer.invoke("sites:create", data),
  // ... other methods
 },
} as const;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

### Validation

All IPC handlers include input validation:

```typescript
// Backend handler with validation
ipcService.registerStandardizedIpcHandler(
 "sites:create",
 async (data: SiteCreationData) => {
  return await siteManager.createSite(data);
 },
 isSiteCreationData // Type guard function
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
 "feature:create",
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
  create: (data: NewFeatureData) => ipcRenderer.invoke("feature:create", data),
 },
};
```

### 4. Use in Frontend

```typescript
// src/components/FeatureComponent.tsx
const newFeature = await window.electronAPI.feature.create(featureData);
```

---

💡 **Best Practices**: Always use TypeScript interfaces, validate inputs, handle errors gracefully, and follow the established naming conventions (`domain:action`).
