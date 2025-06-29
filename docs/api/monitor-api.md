# 🔍 Monitor API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **Monitor API**

The Monitor API provides the core monitoring services for the Uptime Watcher application, including site monitoring, status checking, and data persistence.

## Table of Contents

- [Overview](#overview)
- [UptimeMonitor Class](#uptimemonitor-class)
- [Monitor Services](#monitor-services)
- [Event System](#event-system)
- [Monitoring Operations](#monitoring-operations)
- [Data Management](#data-management)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Overview

The monitoring system is built around several key components:

- **UptimeMonitor**: Central orchestrator for all monitoring operations
- **MonitorFactory**: Creates monitor instances for different types (HTTP, Port)
- **MonitorScheduler**: Manages scheduled monitoring tasks
- **Repository Pattern**: Data access layer for persistence
- **Event System**: Real-time updates and notifications

### Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  UptimeMonitor  │◄──►│   Database      │
│   (Renderer)    │    │   (Main)        │    │   (SQLite)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                        ┌───────▼───────┐
                        │ MonitorScheduler│
                        │  & Factory      │
                        └─────────────────┘
```

## UptimeMonitor Class

### Constructor

```typescript
class UptimeMonitor extends EventEmitter {
    constructor()
}
```

Creates a new UptimeMonitor instance with initialized repositories and services.

**Initialization Process:**

1. Initialize database repositories
2. Create monitor scheduler
3. Set up callback handlers
4. Load existing sites from database
5. Resume monitoring for active monitors

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `sites` | `Map<string, Site>` | Cache of all sites (private) |
| `historyLimit` | `number` | Maximum history records per monitor |
| `isMonitoring` | `boolean` | Global monitoring state |

### Core Methods

#### `getSites(): Promise<Site[]>`

Retrieves all sites with their monitors and history.

```typescript
const sites = await uptimeMonitor.getSites();
console.log(`Found ${sites.length} sites`);
```

**Returns:** Array of Site objects with complete monitor and history data

#### `addSite(site: Site): Promise<Site>`

Adds a new site with its monitors to the system.

```typescript
const newSite = await uptimeMonitor.addSite({
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

- `site`: Site object to add (identifier must be unique)

**Returns:** The added site with any generated fields

**Throws:**

- `DatabaseError`: If database operation fails
- `ValidationError`: If site data is invalid

#### `removeSite(identifier: string): Promise<void>`

Removes a site and all associated data.

```typescript
await uptimeMonitor.removeSite("site-identifier-123");
```

**Parameters:**

- `identifier`: Unique site identifier

**Throws:**

- `NotFoundError`: If site doesn't exist
- `DatabaseError`: If database operation fails

#### `updateSite(identifier: string, updates: Partial<Site>): Promise<void>`

Updates site properties.

```typescript
await uptimeMonitor.updateSite("site-123", {
    name: "Updated Site Name"
});
```

**Parameters:**

- `identifier`: Site identifier
- `updates`: Partial site object with updates

### Monitoring Control Methods

#### `startMonitoring(): void`

Starts monitoring for all sites and monitors.

```typescript
uptimeMonitor.startMonitoring();
```

#### `stopMonitoring(): void`

Stops all monitoring activities.

```typescript
uptimeMonitor.stopMonitoring();
```

#### `startMonitoringForSite(siteId: string, monitorId: string): Promise<void>`

Starts monitoring for a specific monitor.

```typescript
await uptimeMonitor.startMonitoringForSite("site-123", "monitor-456");
```

**Parameters:**

- `siteId`: Site identifier
- `monitorId`: Monitor identifier

#### `stopMonitoringForSite(siteId: string, monitorId: string): Promise<void>`

Stops monitoring for a specific monitor.

```typescript
await uptimeMonitor.stopMonitoringForSite("site-123", "monitor-456");
```

#### `checkSiteManually(siteId: string, monitorId: string): Promise<void>`

Performs an immediate status check for a monitor.

```typescript
await uptimeMonitor.checkSiteManually("site-123", "monitor-456");
```

### Data Management Methods

#### `exportData(): Promise<string>`

Exports all application data as JSON.

```typescript
const jsonData = await uptimeMonitor.exportData();
// Save to file or send to user
```

**Returns:** JSON string containing all sites, monitors, and history

#### `importData(jsonData: string): Promise<void>`

Imports data from JSON backup.

```typescript
await uptimeMonitor.importData(backupJsonString);
```

**Parameters:**

- `jsonData`: JSON string with backup data

**Throws:**

- `ValidationError`: If JSON is invalid or incompatible
- `DatabaseError`: If database operations fail

#### `setHistoryLimit(limit: number): Promise<void>`

Updates the history retention limit and prunes old records.

```typescript
await uptimeMonitor.setHistoryLimit(1000);
```

**Parameters:**

- `limit`: New history limit (must be positive)

#### `getHistoryLimit(): Promise<number>`

Gets the current history retention limit.

```typescript
const limit = await uptimeMonitor.getHistoryLimit();
```

## Monitor Services

### MonitorFactory

Creates monitor instances based on type.

```typescript
const factory = new MonitorFactory();

// Get HTTP monitor
const httpChecker = MonitorFactory.getMonitor("http", {
    timeout: 10000
});

// Get Port monitor  
const portChecker = MonitorFactory.getMonitor("port", {
    timeout: 5000
});
```

### MonitorScheduler

Manages scheduled monitoring tasks.

```typescript
const scheduler = new MonitorScheduler();

// Set callback for scheduled checks
scheduler.setCheckCallback(async (siteId, monitorId) => {
    await performCheck(siteId, monitorId);
});

// Schedule a monitor
scheduler.scheduleMonitor("site-123", "monitor-456", 60000); // Every minute

// Unschedule a monitor
scheduler.unscheduleMonitor("site-123", "monitor-456");
```

### Monitor Types

#### HTTP Monitor

Monitors HTTP/HTTPS endpoints.

```typescript
interface HttpMonitorConfig {
    url: string;
    timeout?: number;
}
```

**Features:**

- Response time measurement
- HTTP status code validation (1xx-4xx = up, 5xx = down)
- Automatic redirect following (max 5 redirects)
- Network error handling

#### Port Monitor

Monitors TCP port connectivity.

```typescript
interface PortMonitorConfig {
    host: string;
    port: number;
    timeout?: number;
}
```

**Features:**

- TCP connection testing
- Connection time measurement
- IPv4/IPv6 support
- Custom timeout settings

## Event System

The UptimeMonitor extends EventEmitter and provides real-time updates.

### Events

#### `status-update`

Emitted when a monitor status changes.

```typescript
uptimeMonitor.on('status-update', (data: StatusUpdate) => {
    console.log(`Monitor ${data.site.identifier} status: ${data.site.monitors[0].status}`);
    
    // Send to renderer process
    mainWindow.webContents.send('status-update', data);
});
```

**Payload:** StatusUpdate object with site data and previous status

#### `site-monitor-down`

Emitted when a monitor goes down.

```typescript
uptimeMonitor.on('site-monitor-down', (data: {
    site: Site;
    monitor: Monitor;
    timestamp: number;
}) => {
    // Show notification
    showNotification(`${data.site.name} is down`);
    
    // Log incident
    logger.warn('Monitor down', { siteId: data.site.identifier, monitorId: data.monitor.id });
});
```

#### `site-monitor-up`

Emitted when a monitor comes back up.

```typescript
uptimeMonitor.on('site-monitor-up', (data: {
    site: Site;
    monitor: Monitor;
    downtime: number;
}) => {
    // Show recovery notification
    showNotification(`${data.site.name} is back up (downtime: ${data.downtime}ms)`);
    
    // Log recovery
    logger.info('Monitor recovered', { siteId: data.site.identifier, downtime: data.downtime });
});
```

#### `db-error`

Emitted when database operations fail.

```typescript
uptimeMonitor.on('db-error', (data: {
    error: Error;
    operation: string;
}) => {
    logger.error(`Database error in ${data.operation}`, data.error);
    
    // Show error to user
    showErrorDialog(`Database error: ${data.error.message}`);
});
```

## Monitoring Operations

### Check Process Flow

1. **Schedule Check**: Monitor scheduler triggers check based on interval
2. **Create Checker**: MonitorFactory creates appropriate checker instance
3. **Perform Check**: Checker performs HTTP request or port connection
4. **Record Result**: Status and response time are recorded
5. **Update Database**: New status and history entry saved
6. **Emit Events**: Status update events fired for real-time updates
7. **Cleanup**: History pruning if limit exceeded

### Status Determination

#### HTTP Monitors

```typescript
// Status determination logic
if (response.status >= 200 && response.status < 400) {
    status = "up";
} else {
    status = "down";
}
```

**Up Conditions:**

- HTTP status 200-399
- Response received within timeout
- No connection errors

**Down Conditions:**

- HTTP status 400+ or < 200
- Connection timeout
- Network errors
- SSL certificate errors (if validation enabled)

#### Port Monitors

```typescript
// Port connection test
try {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    
    const connected = await new Promise((resolve) => {
        socket.connect(port, host, () => resolve(true));
        socket.on('error', () => resolve(false));
        socket.on('timeout', () => resolve(false));
    });
    
    status = connected ? "up" : "down";
} catch (error) {
    status = "down";
}
```

**Up Conditions:**

- Successful TCP connection
- Connection established within timeout

**Down Conditions:**

- Connection refused
- Connection timeout
- Host unreachable
- Network errors

## Data Management

### Repository Pattern

The monitoring system uses a repository pattern for data access:

```typescript
// Site operations
const siteRepository = new SiteRepository();
await siteRepository.create(site);
await siteRepository.findById(identifier);
await siteRepository.update(identifier, updates);
await siteRepository.delete(identifier);

// Monitor operations  
const monitorRepository = new MonitorRepository();
await monitorRepository.create(monitor);
await monitorRepository.findBySiteIdentifier(siteId);

// History operations
const historyRepository = new HistoryRepository();
await historyRepository.create(historyEntry);
await historyRepository.findByMonitorId(monitorId);
await historyRepository.pruneOldHistory(limit);
```

### Database Schema

#### Sites Table

```sql
CREATE TABLE sites (
    identifier TEXT PRIMARY KEY,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Monitors Table

```sql
CREATE TABLE monitors (
    id TEXT PRIMARY KEY,
    site_identifier TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT,
    host TEXT,
    port INTEGER,
    status TEXT DEFAULT 'pending',
    response_time INTEGER,
    last_checked DATETIME,
    monitoring INTEGER DEFAULT 0,
    check_interval INTEGER,
    FOREIGN KEY (site_identifier) REFERENCES sites (identifier) ON DELETE CASCADE
);
```

#### History Table

```sql
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT NOT NULL,
    response_time INTEGER NOT NULL,
    FOREIGN KEY (monitor_id) REFERENCES monitors (id) ON DELETE CASCADE
);
```

## Error Handling

### Error Types

```typescript
class MonitorError extends Error {
    constructor(
        message: string,
        public code: string,
        public monitorId?: string,
        public siteId?: string
    ) {
        super(message);
        this.name = 'MonitorError';
    }
}

class DatabaseError extends Error {
    constructor(
        message: string,
        public operation: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}
```

### Error Recovery

```typescript
// Retry logic for database operations
async function withDbRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw new DatabaseError(
                    `Failed after ${maxRetries} attempts: ${operationName}`,
                    operationName,
                    error
                );
            }
            
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

## Usage Examples

### Complete Monitoring Setup

```typescript
import { UptimeMonitor } from './uptimeMonitor';

// Initialize monitor
const uptimeMonitor = new UptimeMonitor();

// Set up event handlers
uptimeMonitor.on('status-update', (update) => {
    // Send to frontend
    mainWindow.webContents.send('status-update', update);
});

uptimeMonitor.on('site-monitor-down', (data) => {
    // Show system notification
    new Notification(`${data.site.name} is down`, {
        body: `Monitor ${data.monitor.id} failed`,
        icon: path.join(__dirname, 'assets', 'icon-error.png')
    });
});

uptimeMonitor.on('db-error', (data) => {
    logger.error('Database error', data.error);
});

// Add a site with multiple monitors
await uptimeMonitor.addSite({
    identifier: crypto.randomUUID(),
    name: "My Service",
    monitors: [
        {
            id: crypto.randomUUID(),
            type: "http",
            url: "https://api.myservice.com/health",
            status: "pending",
            history: [],
            checkInterval: 60000 // 1 minute
        },
        {
            id: crypto.randomUUID(),
            type: "port",
            host: "database.myservice.com",
            port: 5432,
            status: "pending", 
            history: [],
            checkInterval: 30000 // 30 seconds
        }
    ]
});

// Start monitoring
uptimeMonitor.startMonitoring();
```

### Custom Monitor Implementation

```typescript
// Custom monitor for GraphQL endpoints
class GraphQLMonitor {
    async check(config: { url: string; query: string; timeout: number }) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: config.query }),
                signal: AbortSignal.timeout(config.timeout)
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            // Check for GraphQL errors
            const status = (!data.errors && response.ok) ? "up" : "down";
            
            return { status, responseTime };
        } catch (error) {
            return { 
                status: "down" as const, 
                responseTime: Date.now() - startTime 
            };
        }
    }
}

// Register custom monitor type
MonitorFactory.registerMonitorType('graphql', GraphQLMonitor);
```

## Best Practices

### 1. Monitoring Intervals

```typescript
// ✅ Good - Reasonable intervals
const webSiteInterval = 60000;   // 1 minute for websites
const apiInterval = 30000;       // 30 seconds for APIs  
const databaseInterval = 15000;  // 15 seconds for critical services

// ❌ Bad - Too frequent
const tooFrequent = 1000;        // 1 second - too aggressive
```

### 2. Error Handling

```typescript
// ✅ Good - Comprehensive error handling
try {
    await uptimeMonitor.checkSiteManually(siteId, monitorId);
} catch (error) {
    if (error instanceof MonitorError) {
        logger.warn('Monitor check failed', { 
            siteId: error.siteId, 
            monitorId: error.monitorId 
        });
    } else if (error instanceof DatabaseError) {
        logger.error('Database error during check', error);
    } else {
        logger.error('Unexpected error', error);
    }
}
```

### 3. Resource Management

```typescript
// ✅ Good - Cleanup on shutdown
process.on('SIGTERM', async () => {
    logger.info('Shutting down monitor...');
    uptimeMonitor.stopMonitoring();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Grace period
    process.exit(0);
});
```

### 4. Performance Optimization

```typescript
// ✅ Good - Batch database operations
const batchUpdateHistory = async (entries: StatusHistory[]) => {
    await database.transaction(async (tx) => {
        for (const entry of entries) {
            await historyRepository.create(entry, tx);
        }
    });
};

// ❌ Bad - Individual database calls
for (const entry of entries) {
    await historyRepository.create(entry); // Creates many transactions
}
```

## See Also

- [IPC API](ipc-api) - Communication with frontend
- [Types API](types-api) - Monitor and site type definitions  
- [Store API](store-api) - Frontend state management
- [Hook APIs](hook-apis) - React hooks for monitor data
