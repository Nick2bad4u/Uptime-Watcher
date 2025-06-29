# 📋 Types API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README/) » **Types API**

The Types API defines the core data structures and interfaces used throughout the Uptime Watcher application. This comprehensive type system ensures type safety and provides clear contracts for data models.

## Table of Contents

- [Overview](#overview)
- [Core Types](#core-types)
- [Site Types](#site-types)
- [Status Types](#status-types)
- [Electron API Types](#electron-api-types)
- [Theme Types](#theme-types)
- [Utility Types](#utility-types)
- [Type Guards](#type-guards)
- [Migration Types](#migration-types)
- [Examples](#examples)

## Overview

The type system is organized into logical groups:

- **Core types**: Basic application types and enums
- **Site types**: Site and monitor data structures
- **Status types**: Status tracking and history
- **Electron types**: IPC and native integration
- **Theme types**: Theming and styling
- **Utility types**: Helper types and transformations

All types are fully documented with JSDoc comments and include comprehensive examples.

## Core Types

### `UpdateStatus`

Application update status enumeration.

```typescript
type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";
```

**Values:**

- `"idle"`: No update activity
- `"checking"`: Checking for updates
- `"available"`: Update available for download
- `"downloading"`: Update being downloaded
- `"downloaded"`: Update ready to install
- `"error"`: Update process failed

### `MonitorType`

Supported monitor types for different kinds of checks.

```typescript
type MonitorType = "http" | "port";
```

**Values:**

- `"http"`: HTTP/HTTPS URL monitoring
- `"port"`: TCP port connectivity monitoring

### `StatusType`

Monitor status enumeration.

```typescript
type StatusType = "up" | "down" | "pending";
```

**Values:**

- `"up"`: Service is operational
- `"down"`: Service is down or unreachable
- `"pending"`: Status check in progress or not yet performed

## Site Types

### `Site`

Core interface representing a monitored site with one or more monitors.

```typescript
interface Site {
    /** Unique identifier for the site (UUID) */
    identifier: string;
    
    /** Human-readable name for the site */
    name?: string;
    
    /** Array of monitors for this site */
    monitors: Monitor[];
    
    /** Per-site monitoring state */
    monitoring?: boolean;
}
```

**Usage:**

```typescript
const site: Site = {
    identifier: "550e8400-e29b-41d4-a716-446655440000",
    name: "My Website",
    monitors: [
        {
            id: "monitor-1",
            type: "http",
            url: "https://example.com",
            status: "up",
            history: []
        }
    ],
    monitoring: true
};
```

### `Monitor`

Interface representing a single monitoring endpoint.

```typescript
interface Monitor {
    /** Unique identifier for this monitor (UUID) */
    id: string;
    
    /** Type of monitoring to perform */
    type: MonitorType;
    
    /** Current status of the monitor */
    status: StatusType;
    
    /** Optional URL for HTTP monitors */
    url?: string;
    
    /** Hostname or IP for port monitors */
    host?: string;
    
    /** Port number for port monitors */
    port?: number;
    
    /** Last recorded response time in milliseconds */
    responseTime?: number;
    
    /** Timestamp of last check */
    lastChecked?: Date;
    
    /** Historical status data */
    history: StatusHistory[];
    
    /** Per-monitor monitoring state */
    monitoring?: boolean;
    
    /** Per-monitor check interval (ms) */
    checkInterval?: number;
}
```

**HTTP Monitor Example:**

```typescript
const httpMonitor: Monitor = {
    id: "http-monitor-1",
    type: "http",
    url: "https://api.example.com/health",
    status: "up",
    responseTime: 145,
    lastChecked: new Date(),
    history: [],
    monitoring: true,
    checkInterval: 60000 // 1 minute
};
```

**Port Monitor Example:**

```typescript
const portMonitor: Monitor = {
    id: "port-monitor-1",
    type: "port",
    host: "database.example.com",
    port: 5432,
    status: "up",
    responseTime: 23,
    lastChecked: new Date(),
    history: [],
    monitoring: true,
    checkInterval: 30000 // 30 seconds
};
```

## Status Types

### `StatusHistory`

Historical status record for tracking uptime/downtime over time.

```typescript
interface StatusHistory {
    /** Unix timestamp of when this status was recorded */
    timestamp: number;
    
    /** Status at this point in time */
    status: "up" | "down";
    
    /** Response time in milliseconds */
    responseTime: number;
}
```

**Usage:**

```typescript
const historyEntry: StatusHistory = {
    timestamp: Date.now(),
    status: "up",
    responseTime: 125
};

// Adding to monitor history
monitor.history.push(historyEntry);
```

### `StatusUpdate`

Status update payload sent from backend to frontend.

```typescript
interface StatusUpdate {
    /** Updated site data */
    site: Site;
    
    /** Previous status for change detection */
    previousStatus?: StatusType;
}
```

**Usage:**

```typescript
// Handling status updates
window.electronAPI.onStatusUpdate((update: StatusUpdate) => {
    console.log(`Site ${update.site.name} status changed`);
    
    if (update.previousStatus && update.previousStatus !== update.site.monitors[0].status) {
        // Status actually changed
        showNotification(`${update.site.name} is now ${update.site.monitors[0].status}`);
    }
});
```

## Electron API Types

### `ElectronAPI`

Main interface for Electron IPC communication.

```typescript
declare global {
    interface Window {
        electronAPI: {
            // Site management
            getSites: () => Promise<Site[]>;
            addSite: (site: Omit<Site, "identifier">) => Promise<Site>;
            removeSite: (identifier: string) => Promise<void>;
            updateSite: (identifier: string, updates: Partial<Site>) => Promise<void>;

            // Monitoring control
            checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
            startMonitoringForSite: (siteId: string, monitorId: string) => Promise<boolean>;
            stopMonitoringForSite: (siteId: string, monitorId: string) => Promise<boolean>;

            // Data management
            exportData: () => Promise<string>;
            importData: (data: string) => Promise<void>;
            downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;

            // Settings
            getHistoryLimit: () => Promise<number>;
            updateHistoryLimit: (limit: number) => Promise<void>;

            // Events
            onStatusUpdate: (callback: (update: StatusUpdate) => void) => void;
            removeAllListeners: (channel: string) => void;

            // System
            quitAndInstall: () => void;
        };
    }
}
```

## Theme Types

### `ThemeName`

Available theme names.

```typescript
type ThemeName = "light" | "dark" | "system";
```

### `ThemeColors`

Complete color palette interface.

```typescript
interface ThemeColors {
    primary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;  // Base color
        600: string;
        700: string;
        800: string;
        900: string;
    };
    
    status: {
        up: string;
        down: string;
        pending: string;
        unknown: string;
    };
    
    success: string;
    warning: string;
    error: string;
    errorAlert: string;
    info: string;
    
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        modal: string;
    };
    
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
    };
    
    border: {
        primary: string;
        secondary: string;
        focus: string;
        error: string;
    };
    
    interactive: {
        hover: string;
        active: string;
        disabled: string;
        focus: string;
    };
}
```

### `Theme`

Complete theme object.

```typescript
interface Theme {
    name: ThemeName;
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    metadata: {
        displayName: string;
        description: string;
        version: string;
    };
}
```

## Utility Types

### `Partial<T>`

Makes all properties of T optional.

```typescript
// Usage example
const updateData: Partial<Site> = {
    name: "Updated Name"
    // Other properties are optional
};
```

### `Omit<T, K>`

Excludes specific keys from a type.

```typescript
// Creating a site without the identifier (for new sites)
type NewSiteData = Omit<Site, "identifier">;

const newSite: NewSiteData = {
    name: "New Site",
    monitors: []
    // identifier is excluded
};
```

### `Pick<T, K>`

Selects specific keys from a type.

```typescript
// Only site metadata
type SiteMetadata = Pick<Site, "identifier" | "name">;

const metadata: SiteMetadata = {
    identifier: "site-1",
    name: "Site Name"
    // monitors is excluded
};
```

### `Record<K, V>`

Creates an object type with specific key and value types.

```typescript
// Map of site IDs to selected monitor IDs
type MonitorSelectionMap = Record<string, string>;

const selections: MonitorSelectionMap = {
    "site-1": "monitor-1",
    "site-2": "monitor-3"
};
```

### Custom Utility Types

```typescript
// Extract monitor type from a monitor
type ExtractMonitorType<T> = T extends { type: infer U } ? U : never;

// Non-nullable type
type NonNullable<T> = T extends null | undefined ? never : T;

// Array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Function return type
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

## Type Guards

### Status Type Guards

```typescript
function isValidStatus(status: string): status is StatusType {
    return ["up", "down", "pending"].includes(status);
}

function isUpStatus(status: StatusType): status is "up" {
    return status === "up";
}

function isDownStatus(status: StatusType): status is "down" {
    return status === "down";
}
```

### Monitor Type Guards

```typescript
function isHttpMonitor(monitor: Monitor): monitor is Monitor & { url: string } {
    return monitor.type === "http" && typeof monitor.url === "string";
}

function isPortMonitor(monitor: Monitor): monitor is Monitor & { host: string; port: number } {
    return monitor.type === "port" && 
           typeof monitor.host === "string" && 
           typeof monitor.port === "number";
}
```

### Site Type Guards

```typescript
function isValidSite(obj: any): obj is Site {
    return obj &&
           typeof obj.identifier === "string" &&
           Array.isArray(obj.monitors) &&
           obj.monitors.every(isValidMonitor);
}

function isValidMonitor(obj: any): obj is Monitor {
    return obj &&
           typeof obj.id === "string" &&
           isValidMonitorType(obj.type) &&
           isValidStatus(obj.status) &&
           Array.isArray(obj.history);
}

function isValidMonitorType(type: string): type is MonitorType {
    return ["http", "port"].includes(type);
}
```

### Usage Examples

```typescript
function processMonitor(monitor: Monitor) {
    if (isHttpMonitor(monitor)) {
        // TypeScript knows monitor.url is available
        console.log(`HTTP monitor: ${monitor.url}`);
    } else if (isPortMonitor(monitor)) {
        // TypeScript knows monitor.host and monitor.port are available
        console.log(`Port monitor: ${monitor.host}:${monitor.port}`);
    }
}

// Safe status checking
function getStatusColor(status: string): string {
    if (isValidStatus(status)) {
        switch (status) {
            case "up": return "#10b981";
            case "down": return "#ef4444";
            case "pending": return "#f59e0b";
        }
    }
    return "#6b7280"; // Unknown status
}
```

## Migration Types

### Legacy Site Types

```typescript
// Legacy site structure (pre-v2.0)
interface LegacySite {
    id: string;
    name: string;
    url: string;
    monitorType: MonitorType;
    status: StatusType;
    responseTime?: number;
    lastChecked?: Date;
    history?: StatusHistory[];
}

// Migration helper type
type MigrateSite<T> = T extends LegacySite 
    ? Omit<T, "id" | "url" | "monitorType" | "status" | "responseTime" | "lastChecked" | "history"> & Site
    : T;
```

### Version-Specific Types

```typescript
// Type versioning for backwards compatibility
interface SiteV1 {
    id: string;
    name: string;
    url: string;
    // ... v1 fields
}

interface SiteV2 {
    identifier: string;
    name?: string;
    monitors: Monitor[];
    // ... v2 fields
}

type AnySite = SiteV1 | SiteV2;

// Version detection
function isSiteV2(site: AnySite): site is SiteV2 {
    return 'monitors' in site && Array.isArray(site.monitors);
}
```

## Examples

### Complete Type Usage in Components

```typescript
import { Site, Monitor, StatusHistory, StatusUpdate } from '../types';

interface SiteCardProps {
    site: Site;
    onStatusChange?: (update: StatusUpdate) => void;
}

function SiteCard({ site, onStatusChange }: SiteCardProps) {
    // Type-safe monitor access
    const primaryMonitor: Monitor | undefined = site.monitors[0];
    
    if (!primaryMonitor) {
        return <div>No monitors configured</div>;
    }

    // Type guards ensure safety
    if (isHttpMonitor(primaryMonitor)) {
        return (
            <div>
                <h3>{site.name}</h3>
                <p>URL: {primaryMonitor.url}</p>
                <p>Status: {primaryMonitor.status}</p>
            </div>
        );
    }

    if (isPortMonitor(primaryMonitor)) {
        return (
            <div>
                <h3>{site.name}</h3>
                <p>Host: {primaryMonitor.host}:{primaryMonitor.port}</p>
                <p>Status: {primaryMonitor.status}</p>
            </div>
        );
    }

    return <div>Unknown monitor type</div>;
}
```

### Type-Safe API Usage

```typescript
// Type-safe site creation
async function createNewSite(siteData: Omit<Site, "identifier">): Promise<Site> {
    try {
        const createdSite = await window.electronAPI.addSite(siteData);
        return createdSite;
    } catch (error) {
        throw new Error(`Failed to create site: ${error.message}`);
    }
}

// Type-safe status update handling
function setupStatusListener() {
    window.electronAPI.onStatusUpdate((update: StatusUpdate) => {
        // TypeScript ensures update has the correct structure
        console.log(`Site ${update.site.identifier} updated`);
        
        if (update.previousStatus) {
            console.log(`Status changed from ${update.previousStatus} to ${update.site.monitors[0]?.status}`);
        }
    });
}
```

### Advanced Type Patterns

```typescript
// Conditional types for monitor URLs
type MonitorUrl<T extends MonitorType> = T extends "http" 
    ? { url: string; host?: never; port?: never }
    : T extends "port"
    ? { host: string; port: number; url?: never }
    : never;

// Create typed monitor
function createMonitor<T extends MonitorType>(
    type: T,
    config: MonitorUrl<T> & { id: string; status: StatusType }
): Monitor {
    return {
        ...config,
        type,
        history: []
    };
}

// Usage
const httpMonitor = createMonitor("http", {
    id: "monitor-1",
    url: "https://example.com",
    status: "pending"
});

const portMonitor = createMonitor("port", {
    id: "monitor-2", 
    host: "localhost",
    port: 3000,
    status: "pending"
});
```

## See Also

- [🏪 Store API](store-api/) - State management types and interfaces
- [🔗 IPC API](ipc-api/) - Electron communication type definitions
- [🎨 Theme API](theme-api/) - Theme system types and structures
- [🧩 Hook APIs](hook-apis/) - Hook parameter and return types
- [📊 Monitor API](monitor-api/) - Monitoring service types
- [💾 Database API](database-api/) - Database entity types
- [🛠️ Utilities API](utilities-api/) - Helper function types

---

> **Related:** [📚 API Reference](README/) | [📖 Documentation Home](../README)
