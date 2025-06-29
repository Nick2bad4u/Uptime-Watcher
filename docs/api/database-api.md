# 🗄️ Database API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README/) » **Database API**

Comprehensive documentation for SQLite-based data persistence using the repository pattern.

## 📊 Overview

The database layer provides robust data persistence through:

- **DatabaseService**: Connection and schema management
- **SiteRepository**: Site data persistence
- **MonitorRepository**: Monitor configuration management
- **HistoryRepository**: Status history tracking and pruning
- **SettingsRepository**: Application settings persistence

## 🔧 DatabaseService

### Core Methods

#### `getInstance(): DatabaseService`

```typescript
const dbService = DatabaseService.getInstance();
```

Get singleton database service instance.

#### `initialize(): Promise<Database>`

```typescript
await dbService.initialize();
```

Initialize database connection and create tables.

#### `getDatabase(): Database`

```typescript
const db = dbService.getDatabase();
```

Get active database connection. Must call `initialize()` first.

#### `downloadBackup(): Promise<{buffer: Buffer, fileName: string}>`

```typescript
const { buffer, fileName } = await dbService.downloadBackup();
```

Create database backup for export functionality.

#### `close(): Promise<void>`

```typescript
await dbService.close();
```

Close database connection gracefully.

## 📊 SiteRepository

### Core Operations

#### `findAll(): Promise<Array<{identifier: string, name?: string}>>`

```typescript
const sites = await siteRepo.findAll();
```

Get all sites without monitor data (lightweight).

#### `getByIdentifier(identifier: string): Promise<Site | undefined>`

```typescript
const completeSite = await siteRepo.getByIdentifier("example-com");
```

Get complete site with monitors and history (heavy operation).

#### `upsert(site: Pick<Site, "identifier" | "name">): Promise<void>`

```typescript
await siteRepo.upsert({
    identifier: "example-com",
    name: "Example Website"
});
```

Create or update site using INSERT OR REPLACE logic.

#### `delete(identifier: string): Promise<boolean>`

```typescript
const deleted = await siteRepo.delete("example-com");
```

Delete site from database. Returns true if deleted.

### Bulk Operations

#### `bulkInsert(sites: Array<{identifier: string, name?: string}>): Promise<void>`

```typescript
await siteRepo.bulkInsert([
    { identifier: "site1", name: "Site 1" },
    { identifier: "site2", name: "Site 2" }
]);
```

Insert multiple sites efficiently for data import.

#### `deleteAll(): Promise<void>`

```typescript
await siteRepo.deleteAll();
```

Clear all sites from database.

## 🔧 MonitorRepository

### Core CRUD Operations

#### `findBySiteIdentifier(siteIdentifier: string): Promise<Site["monitors"]>`

```typescript
const monitors = await monitorRepo.findBySiteIdentifier("example-com");
```

Get all monitors for a specific site.

#### `create(siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): Promise<string>`

```typescript
const newId = await monitorRepo.create("example-com", {
    type: "http",
    url: "https://example.com",
    monitoring: true,
    checkInterval: 60000
});
```

Create new monitor and return assigned ID.

#### `update(monitorId: string, monitor: Partial<Site["monitors"][0]>): Promise<void>`

```typescript
await monitorRepo.update("123", {
    monitoring: false,
    checkInterval: 120000
});
```

Update existing monitor (only provided fields).

#### `delete(monitorId: string): Promise<boolean>`

```typescript
const deleted = await monitorRepo.delete("123");
```

Delete monitor and its history (cascading delete).

### Monitor Bulk Operations

#### `bulkCreate(siteIdentifier: string, monitors: Array<Site["monitors"][0]>): Promise<Array<Site["monitors"][0]>>`

```typescript
const createdMonitors = await monitorRepo.bulkCreate("example-com", [
    { type: "http", url: "https://example.com" },
    { type: "port", host: "example.com", port: 80 }
]);
```

Create multiple monitors efficiently with assigned IDs.

## 📈 HistoryRepository

### History Core Operations

#### `findByMonitorId(monitorId: string): Promise<StatusHistory[]>`

```typescript
const history = await historyRepo.findByMonitorId("123");
```

Get all history entries for a monitor (ordered by timestamp DESC).

#### `addEntry(monitorId: string, entry: StatusHistory, details?: string): Promise<void>`

```typescript
await historyRepo.addEntry("123", {
    timestamp: Date.now(),
    status: "up",
    responseTime: 234
}, "OK");
```

Add new status history entry.

#### `pruneHistory(monitorId: string, limit: number): Promise<void>`

```typescript
await historyRepo.pruneHistory("123", 1000);
```

Keep only the most recent N entries for a monitor.

#### `getHistoryCount(monitorId: string): Promise<number>`

```typescript
const count = await historyRepo.getHistoryCount("123");
```

Get total history entry count for monitor.

### History Bulk Operations

#### `bulkInsert(monitorId: string, historyEntries: Array<StatusHistory & {details?: string}>): Promise<void>`

```typescript
await historyRepo.bulkInsert("123", [
    { timestamp: 1640995200000, status: "up", responseTime: 120 },
    { timestamp: 1640995260000, status: "down", responseTime: 0 }
]);
```

Insert multiple history entries efficiently.

## ⚙️ SettingsRepository

### Settings Core Operations

#### `get(key: string): Promise<string | undefined>`

```typescript
const historyLimit = await settingsRepo.get("historyLimit");
```

Get setting value by key.

#### `set(key: string, value: string): Promise<void>`

```typescript
await settingsRepo.set("historyLimit", "1000");
```

Set setting value (INSERT OR REPLACE).

#### `getAll(): Promise<Record<string, string>>`

```typescript
const allSettings = await settingsRepo.getAll();
```

Get all settings as key-value object.

#### `bulkInsert(settings: Record<string, string>): Promise<void>`

```typescript
await settingsRepo.bulkInsert({
    "historyLimit": "1000",
    "checkInterval": "60000",
    "theme": "dark"
});
```

Insert multiple settings efficiently.

## 🔄 Database Schema

### Tables

#### sites

```sql
CREATE TABLE sites (
    identifier TEXT PRIMARY KEY,
    name TEXT
);
```

#### monitors

```sql
CREATE TABLE monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_identifier TEXT,
    type TEXT,
    url TEXT,
    host TEXT,
    port INTEGER,
    checkInterval INTEGER,
    monitoring BOOLEAN,
    status TEXT,
    responseTime INTEGER,
    lastChecked DATETIME,
    FOREIGN KEY(site_identifier) REFERENCES sites(identifier)
);
```

#### history

```sql
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER,
    timestamp INTEGER,
    status TEXT,
    responseTime INTEGER,
    details TEXT,
    FOREIGN KEY(monitor_id) REFERENCES monitors(id)
);
```

#### settings

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

## 🚀 Usage Example

```typescript
import { DatabaseService, SiteRepository, MonitorRepository } from "./services/database";

// Initialize
const dbService = DatabaseService.getInstance();
await dbService.initialize();

// Create repositories
const siteRepo = new SiteRepository();
const monitorRepo = new MonitorRepository();

// Create site with monitor
await siteRepo.upsert({
    identifier: "example-com",
    name: "Example Website"
});

const monitorId = await monitorRepo.create("example-com", {
    type: "http",
    url: "https://example.com",
    monitoring: true,
    checkInterval: 60000
});

// Get complete site data
const completeSite = await siteRepo.getByIdentifier("example-com");
```

## ⚠️ Important Notes

- **Transaction Safety**: SQLite provides built-in transaction safety
- **Foreign Keys**: Constraints are enforced with cascading deletes
- **Performance**: Use `findAll()` for listings, `getByIdentifier()` for full data
- **Error Handling**: All methods can throw database errors
- **Connection**: Always initialize before using repositories

## See Also

- [📋 Types API](types-api/) - Site, monitor, and history type definitions
- [🏪 Store API](store-api/) - State management and data flow
- [📊 Monitor API](monitor-api/) - Monitoring service integration
- [🔔 Notification API](notification-api/) - Status change notifications
- [📊 Chart API](chart-api/) - History data visualization
- [🛠️ Utilities API](utilities-api/) - Database helper utilities

---

> **Related:** [📚 API Reference](README/) | [📖 Documentation Home](../README)
