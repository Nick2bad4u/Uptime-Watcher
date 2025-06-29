# 🔗 IPC API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **IPC API**

The IPC (Inter-Process Communication) API provides secure communication between the Electron main process and renderer process. It handles site management, monitoring control, data operations, and system functions.

## Table of Contents

- [Overview](#overview)
- [API Domains](#api-domains)
- [Site Management](#site-management)
- [Monitoring Control](#monitoring-control)
- [Data Management](#data-management)
- [Settings Management](#settings-management)
- [Event Handling](#event-handling)
- [System Operations](#system-operations)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

## Overview

The IPC API is exposed through `window.electronAPI` in the renderer process using Electron's `contextBridge` for secure communication. All operations are asynchronous and return Promises.

### API Structure

```typescript
interface ElectronAPI {
    // Site Management (flat structure for backward compatibility)
    addSite: (site: Site) => Promise<Site>;
    getSites: () => Promise<Site[]>;
    removeSite: (identifier: string) => Promise<boolean>;
    updateSite: (identifier: string, updates: Partial<Site>) => Promise<Site>;
    checkSiteNow: (identifier: string, monitorType: string) => Promise<StatusUpdate | null>;
    
    // Monitoring Control (flat structure for backward compatibility)
    startMonitoring: () => Promise<boolean>;
    stopMonitoring: () => Promise<boolean>;
    startMonitoringForSite: (identifier: string, monitorType?: string) => Promise<boolean>;
    stopMonitoringForSite: (identifier: string, monitorType?: string) => Promise<boolean>;
    
    // Data Management (flat structure for backward compatibility)
    exportData: () => Promise<string>;
    importData: (data: string) => Promise<boolean>;
    downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
    
    // Settings (flat structure for backward compatibility)
    getHistoryLimit: () => Promise<number>;
    updateHistoryLimit: (limit: number) => Promise<void>;
    
    // Events (flat structure for backward compatibility)
    onStatusUpdate: (callback: (data: StatusUpdate) => void) => void;
    onUpdateStatus: (callback: (data: unknown) => void) => void;
    removeAllListeners: (channel: string) => void;
    
    // System (flat structure for backward compatibility)
    quitAndInstall: () => void;
    
    // Organized APIs (new structure for better maintainability)
    sites: SiteAPI;
    monitoring: MonitoringAPI;
    data: DataAPI;
    settings:
    settings: SettingsAPI;
    events: EventsAPI;
    system: SystemAPI;
}
```

## API Domains

### Site Management

The Site API handles CRUD operations for monitored sites.

#### `addSite(site: Site): Promise<Site>`

Creates a new site with its monitors.

```typescript
const newSite = await window.electronAPI.addSite({
    identifier: crypto.randomUUID(),
    name: "My Website",
    monitors: [{
        id: crypto.randomUUID(),
        type: "http",
        url: "https://example.com",
        status: "pending",
        history: []
    }]
});
```

**Parameters:**

- `site`: Site object containing identifier, name, and monitors array

**Returns:** Complete site object with any auto-generated fields

**Throws:**

- `Error` - Invalid site data or database operation failed

#### `getSites(): Promise<Site[]>`

Retrieves all sites from the database.

```typescript
const sites = await window.electronAPI.getSites();
console.log(`Found ${sites.length} sites`);
```

**Returns:** Array of all sites with their monitors

#### `removeSite(identifier: string): Promise<boolean>`

Removes a site and all associated data.

```typescript
const removed = await window.electronAPI.removeSite("site-id-123");
if (removed) {
    console.log("Site removed successfully");
} else {
    console.log("Site not found");
}
```

**Parameters:**

- `identifier`: Unique site identifier

**Returns:** `true` if site was found and removed, `false` if not found

**Throws:**

- `Error` - Database operation failed

#### `updateSite(identifier: string, updates: Partial<Site>): Promise<Site>`

Updates site properties.

```typescript
const updatedSite = await window.electronAPI.updateSite("site-id-123", {
    name: "Updated Site Name"
});
console.log("Site updated:", updatedSite);
```

**Parameters:**

- `identifier`: Unique site identifier
- `updates`: Partial site object with updates

**Returns:** Updated site object

#### `checkSiteNow(identifier: string, monitorType: string): Promise<StatusUpdate | null>`

Triggers an immediate status check for a specific monitor.

```typescript
const result = await window.electronAPI.checkSiteNow("site-id-123", "monitor-id-456");
if (result) {
    console.log("Check completed:", result);
    console.log("Site status:", result.site.monitors[0].status);
} else {
    console.log("Check completed but no status update generated");
}
```

**Parameters:**

- `identifier`: Site identifier
- `monitorType`: Monitor identifier (monitor ID) to check

**Returns:** StatusUpdate object if status changed, null if no change occurred

### Monitoring Control

The Monitoring API controls the monitoring lifecycle.

#### `startMonitoring(): Promise<boolean>`

Starts monitoring for all enabled sites.

```typescript
const success = await window.electronAPI.startMonitoring();
if (success) {
    console.log("Monitoring started");
}
```

**Returns:** `true` if monitoring started successfully

#### `stopMonitoring(): Promise<boolean>`

Stops all monitoring activities.

```typescript
const success = await window.electronAPI.stopMonitoring();
```

**Returns:** `true` if monitoring stopped successfully

#### `startMonitoringForSite(identifier: string, monitorType?: string): Promise<boolean>`

Starts monitoring for a specific site or monitor.

```typescript
// Start all monitors for a site
await window.electronAPI.startMonitoringForSite("site-id-123");

// Start specific monitor
await window.electronAPI.startMonitoringForSite("site-id-123", "monitor-id-456");
```

**Parameters:**

- `identifier`: Site identifier
- `monitorType`: Optional monitor identifier (all monitors if omitted)

**Returns:** `true` if monitoring started successfully

#### `stopMonitoringForSite(identifier: string, monitorType?: string): Promise<boolean>`

Stops monitoring for a specific site or monitor.

```typescript
await window.electronAPI.stopMonitoringForSite("site-id-123", "monitor-id-456");
```

**Parameters:**

- `identifier`: Site identifier  
- `monitorType`: Optional monitor identifier

**Returns:** `true` if monitoring stopped successfully

### Data Management

The Data API handles import/export and backup operations.

#### `exportData(): Promise<string>`

Exports all application data as JSON.

```typescript
const jsonData = await window.electronAPI.exportData();
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);

// Trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'uptime-watcher-backup.json';
a.click();
```

**Returns:** JSON string containing all application data

#### `importData(data: string): Promise<boolean>`

Imports data from JSON backup.

```typescript
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';

fileInput.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
        const text = await file.text();
        const success = await window.electronAPI.importData(text);
        if (success) {
            console.log("Data imported successfully");
            // Refresh application state
            window.location.reload();
        }
    }
};

fileInput.click();
```

**Parameters:**

- `data`: JSON string with backup data

**Returns:** `true` if import was successful

**Throws:**

- `Error` - Invalid data format or import operation failed

#### `downloadSQLiteBackup(): Promise<{ buffer: ArrayBuffer; fileName: string }>`

Downloads the raw SQLite database file.

```typescript
const { buffer, fileName } = await window.electronAPI.downloadSQLiteBackup();

const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = fileName;
a.click();
```

**Returns:** Object with database buffer and suggested filename

### Settings Management

The Settings API manages application configuration.

#### `getHistoryLimit(): Promise<number>`

Gets the current history retention limit.

```typescript
const limit = await window.electronAPI.getHistoryLimit();
console.log(`Current history limit: ${limit} records`);
```

**Returns:** Number of history records to retain per monitor

#### `updateHistoryLimit(limit: number): Promise<void>`

Updates the history retention limit and prunes old data.

```typescript
await window.electronAPI.updateHistoryLimit(1000);
```

**Parameters:**

- `limit`: New history limit (must be positive)

**Throws:**

- `Error` - Invalid limit value or update operation failed

### Event Handling

The Events API manages real-time communication from the main process.

#### `onStatusUpdate(callback: (data: StatusUpdate) => void): void`

Subscribes to real-time status updates.

```typescript
window.electronAPI.onStatusUpdate((statusUpdate) => {
    console.log('Site status changed:', statusUpdate);
    
    // Update UI with new status
    updateSiteStatus(statusUpdate.site);
    
    // Show notification if status changed
    if (statusUpdate.previousStatus !== statusUpdate.site.status) {
        showNotification(`${statusUpdate.site.name} is now ${statusUpdate.site.status}`);
    }
});
```

**Parameters:**

- `callback`: Function to handle status updates

**StatusUpdate Structure:**

```typescript
interface StatusUpdate {
    site: Site;
    previousStatus?: "up" | "down" | "pending";
}
```

#### `onUpdateStatus(callback: (data: unknown) => void): void`

Subscribes to application update status changes (auto-updater events).

```typescript
window.electronAPI.onUpdateStatus((updateData) => {
    console.log('Application update status:', updateData);
    // Handle update notifications, download progress, etc.
});
```

**Parameters:**

- `callback`: Function to handle update status events

**Note:** This event is used for application auto-updater notifications, separate from site monitoring status updates.

#### `removeAllListeners(channel: string): void`

Removes all listeners for a specific IPC channel.

```typescript
// Cleanup when component unmounts
window.electronAPI.removeAllListeners("status-update");
```

**Parameters:**

- `channel`: IPC channel name to clear

### System Operations

The System API handles application lifecycle operations.

#### `quitAndInstall(): void`

Quits the application and installs a pending update.

```typescript
// Show confirmation dialog
if (confirm("Install update and restart application?")) {
    window.electronAPI.quitAndInstall();
}
```

**Note:** This function does not return as the application will restart.

## Usage Examples

### Complete Site Management Workflow

```typescript
class SiteManager {
    private sites: Site[] = [];

    async initialize() {
        // Load existing sites
        this.sites = await window.electronAPI.getSites();
        
        // Subscribe to updates
        window.electronAPI.onStatusUpdate((update) => {
            this.handleStatusUpdate(update);
        });
        
        // Start monitoring
        await window.electronAPI.startMonitoring();
    }

    async createSite(name: string, url: string) {
        const site: Site = {
            identifier: crypto.randomUUID(),
            name,
            monitors: [{
                id: crypto.randomUUID(),
                type: "http",
                url,
                status: "pending",
                history: []
            }]
        };

        try {
            const newSite = await window.electronAPI.addSite(site);
            this.sites.push(newSite);
            
            // Start monitoring for new site
            await window.electronAPI.startMonitoringForSite(newSite.identifier);
            
            return newSite;
        } catch (error) {
            console.error("Failed to create site:", error);
            throw error;
        }
    }

    async deleteSite(identifier: string) {
        try {
            // Stop monitoring first
            await window.electronAPI.stopMonitoringForSite(identifier);
            
            // Remove from database
            const removed = await window.electronAPI.removeSite(identifier);
            
            if (removed) {
                // Update local state
                this.sites = this.sites.filter(site => site.identifier !== identifier);
                console.log("Site removed successfully");
            } else {
                console.log("Site not found");
            }
        } catch (error) {
            console.error("Failed to delete site:", error);
            throw error;
        }
    }

    private handleStatusUpdate(update: StatusUpdate) {
        // Update local site data
        const siteIndex = this.sites.findIndex(s => s.identifier === update.site.identifier);
        if (siteIndex >= 0) {
            this.sites[siteIndex] = update.site;
        }

        // Trigger UI updates
        this.notifyListeners(update);
    }
}
```

### Data Backup and Restore

```typescript
class BackupManager {
    async createJSONBackup() {
        try {
            const data = await window.electronAPI.exportData();
            
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `uptime-watcher-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Backup failed:", error);
            throw new Error("Failed to create backup");
        }
    }

    async createSQLiteBackup() {
        try {
            const { buffer, fileName } = await window.electronAPI.downloadSQLiteBackup();
            
            const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("SQLite backup failed:", error);
            throw new Error("Failed to create SQLite backup");
        }
    }

    async restoreFromJSON(file: File) {
        try {
            const text = await file.text();
            
            // Validate JSON format
            JSON.parse(text);
            
            // Import data
            const success = await window.electronAPI.importData(text);
            
            if (success) {
                // Refresh application state
                window.location.reload();
            } else {
                throw new Error("Import operation returned false");
            }
        } catch (error) {
            console.error("Restore failed:", error);
            throw new Error("Failed to restore from backup");
        }
    }
}
```

## Error Handling

### Common Error Types

```typescript
// Standard JavaScript Error is thrown by IPC handlers
interface IpcError extends Error {
    name: string;
    message: string;
    stack?: string;
}
```

### Error Categories

1. **Error**: General errors from validation, database operations, or network issues
2. **TypeError**: Type-related errors from invalid input
3. **RangeError**: Out-of-range values (e.g., invalid history limits)

**Note:** The IPC layer throws standard JavaScript Error objects rather than custom error types. Error categorization is based on the error message and context.

### Error Handling Pattern

```typescript
async function safeIpcCall<T>(
    operation: () => Promise<T>,
    fallback?: T
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        console.error("IPC operation failed:", error);
        
        if (error instanceof Error) {
            // Handle based on error message patterns since specific error types aren't used
            if (error.message.includes("identifier is required")) {
                showUserError("Site identifier is required");
            } else if (error.message.includes("monitors must be an array")) {
                showUserError("Invalid monitor configuration");
            } else if (error.message.includes("not found")) {
                showUserError("Resource not found");
            } else {
                showUserError("An unexpected error occurred: " + error.message);
            }
        }
        
        if (fallback !== undefined) {
            return fallback;
        }
        
        throw error;
    }
}

// Usage
const sites = await safeIpcCall(
    () => window.electronAPI.getSites(),
    [] // fallback to empty array
);
```

### Retry Logic

```typescript
async function retryIpcCall<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.warn(`IPC call failed (attempt ${attempt}/${maxRetries}):`, error);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    
    throw new Error("Max retries exceeded");
}
```

## Security Considerations

### Context Isolation

The IPC API uses Electron's `contextBridge` to securely expose functionality to the renderer process. No Node.js APIs are directly exposed.

### Input Validation

All IPC handlers validate input data on the main process side:

```typescript
// Example validation in main process
ipcMain.handle("add-site", async (_, site) => {
    // Validate site structure
    if (!site?.identifier) {
        throw new Error("Site identifier is required");
    }
    
    if (!Array.isArray(site.monitors)) {
        throw new Error("Site monitors must be an array");
    }
    
    // Continue with validated data...
});
```

### Security Notes

- **No openExternal API**: External URL opening is handled through type guards in components, not exposed through IPC
- **Limited API Surface**: Only essential monitoring and data operations are exposed
- **Context Isolation**: Renderer process cannot access Node.js APIs directly

### Rate Limiting

Consider implementing rate limiting for frequent operations:

```typescript
class RateLimiter {
    private lastCall = 0;
    private minInterval: number;

    constructor(minInterval: number) {
        this.minInterval = minInterval;
    }

    async throttle<T>(operation: () => Promise<T>): Promise<T> {
        const now = Date.now();
        const timeSince = now - this.lastCall;
        
        if (timeSince < this.minInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minInterval - timeSince)
            );
        }
        
        this.lastCall = Date.now();
        return operation();
    }
}

const checkRateLimiter = new RateLimiter(1000); // 1 second minimum

// Rate-limited status check
const checkSite = (id: string, monitorId: string) =>
    checkRateLimiter.throttle(() => 
        window.electronAPI.checkSiteNow(id, monitorId)
    );
```

## See Also

- [🏪 Store API](store-api) - Frontend state management integration
- [📋 Types API](types-api) - TypeScript interface definitions
- [📊 Monitor API](monitor-api) - Backend monitoring services
- [💾 Database API](database-api) - Data persistence layer
- [🔔 Notification API](notification-api) - System notifications
- [📝 Logger API](logger-api) - Logging and debugging

---

> **Related:** [📚 API Reference](README) | [📖 Documentation Home](../README)

- [Monitor API](monitor-api) - Monitoring services
