# 📡 API & IPC Documentation

> **Interface Reference**: Comprehensive guide to IPC communication, events, and API patterns in Uptime Watcher.

## 📋 Overview

Uptime Watcher uses type-safe IPC (Inter-Process Communication) between the Electron main process and React renderer, along with an event-driven architecture for internal communication.

## 🔌 IPC Communication

### Access Pattern

All IPC communication goes through the preload-exposed `window.electronAPI` object:

```typescript
// Available in renderer process (React components)
const result = await window.electronAPI.sites.getAll();
const site = await window.electronAPI.sites.create(siteData);
```

### Type Safety

All IPC calls are fully typed with TypeScript interfaces:

```typescript
// Types are automatically inferred
const sites: Site[] = await window.electronAPI.sites.getAll();
const newSite: Site = await window.electronAPI.sites.create({
  name: "Example Site",
  url: "https://example.com",
  monitors: [...]
});
```

## 🗂️ IPC API Reference

### Sites API

#### `sites.getAll(): Promise<Site[]>`

Retrieves all configured sites.

```typescript
const sites = await window.electronAPI.sites.getAll();
```

#### `sites.create(data: SiteCreationData): Promise<Site>`

Creates a new site with monitors.

```typescript
const newSite = await window.electronAPI.sites.create({
 name: "My Website",
 url: "https://mywebsite.com",
 monitors: [
  {
   type: "http",
   checkInterval: 30000,
   retryAttempts: 3,
   timeout: 10000,
  },
 ],
});
```

#### `sites.update(id: string, data: Partial<Site>): Promise<Site>`

Updates an existing site.

```typescript
const updatedSite = await window.electronAPI.sites.update(siteId, {
 name: "New Site Name",
 description: "Updated description",
});
```

#### `sites.delete(id: string): Promise<void>`

Deletes a site and all its monitors.

```typescript
await window.electronAPI.sites.delete(siteId);
```

#### `sites.startMonitoring(id: string): Promise<void>`

Starts monitoring for a specific site.

```typescript
await window.electronAPI.sites.startMonitoring(siteId);
```

#### `sites.stopMonitoring(id: string): Promise<void>`

Stops monitoring for a specific site.

```typescript
await window.electronAPI.sites.stopMonitoring(siteId);
```

### Monitors API

#### `monitors.checkManually(siteId: string, monitorId: string): Promise<MonitorCheckResult>`

Performs a manual health check for a specific monitor.

```typescript
const result = await window.electronAPI.monitors.checkManually(
 siteId,
 monitorId
);
// result: { status: "up" | "down", responseTime: number, details?: string, error?: string }
```

### History API

#### `history.getByMonitor(monitorId: string, options?: HistoryQuery): Promise<HistoryEntry[]>`

Retrieves historical data for a monitor.

```typescript
const history = await window.electronAPI.history.getByMonitor(monitorId, {
 limit: 100,
 startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
 endDate: new Date(),
});
```

#### `history.getStatsByMonitor(monitorId: string, options?: StatsQuery): Promise<MonitorStats>`

Gets statistical summary for a monitor.

```typescript
const stats = await window.electronAPI.history.getStatsByMonitor(monitorId, {
 period: "24h", // '1h', '24h', '7d', '30d'
});
// stats: { uptime: 99.5, avgResponseTime: 245, totalChecks: 1440 }
```

### Settings API

#### `settings.get(): Promise<AppSettings>`

Retrieves application settings.

```typescript
const settings = await window.electronAPI.settings.get();
```

#### `settings.update(data: Partial<AppSettings>): Promise<AppSettings>`

Updates application settings.

```typescript
const updated = await window.electronAPI.settings.update({
 notifications: {
  enabled: true,
  onStatusChange: true,
  onFailure: true,
 },
 theme: "dark",
});
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

## 🔗 Frontend Integration

### React Components

```typescript
import { useSitesStore } from '../stores/useSitesStore';

function SiteManager() {
  const { sites, addSite, updateSite, removeSite } = useSitesStore();

  const handleCreateSite = async (siteData: SiteCreationData) => {
    try {
      const newSite = await window.electronAPI.sites.create(siteData);
      addSite(newSite); // Update local state
    } catch (error) {
      console.error('Failed to create site:', error);
    }
  };

  return (
    <div>
      {sites.map(site => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}
```

### Store Integration

```typescript
// Zustand store with IPC integration
export const useSitesStore = create<SitesStore>()((set, get) => ({
 sites: [],

 fetchSites: async () => {
  const sites = await window.electronAPI.sites.getAll();
  set({ sites });
 },

 addSite: async (siteData: SiteCreationData) => {
  const newSite = await window.electronAPI.sites.create(siteData);
  set((state) => ({ sites: [...state.sites, newSite] }));
  return newSite;
 },

 // ... other actions
}));
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

#### HTTP Monitor

```typescript
interface HttpMonitorConfig {
 method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD";
 headers?: Record<string, string>;
 body?: string;
 expectedStatusCode?: number;
 expectedContent?: string;
 followRedirects: boolean;
 sslCheck: boolean;
}
```

#### Port Monitor

```typescript
interface PortMonitorConfig {
 port: number;
 host?: string; // defaults to site URL hostname
}
```

#### Ping Monitor

```typescript
interface PingMonitorConfig {
 packetSize: number;
 packetCount: number;
}
```

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
