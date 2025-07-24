# Class: DatabaseManager

Defined in: [electron/managers/DatabaseManager.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L89)

Database operations manager for the Uptime Watcher application.

## Remarks

The DatabaseManager serves as the central coordination point for all database-related
operations including initialization, data import/export, backup management, and site
loading. It provides a unified interface for database operations while maintaining
consistency with the service-based architecture.

Key responsibilities:
- **Database Initialization**: Setup and schema management
- **Data Import/Export**: JSON-based data persistence and restoration
- **Backup Management**: SQLite database backup creation and download
- **Site Loading**: Coordinated loading of sites from database into cache
- **History Management**: Configuration and limits for status history retention
- **Event Coordination**: Typed event emission for system-wide coordination

The manager uses dependency injection for testability and follows the repository
pattern for data access. All operations are designed to be atomic and maintain
data consistency using the withErrorHandling utility for standardized error
management and logging.

## Example

```typescript
const databaseManager = new DatabaseManager({
  eventEmitter: typedEventBus,
  repositories: {
    database: databaseService,
    history: historyRepository,
    monitor: monitorRepository,
    settings: settingsRepository,
    site: siteRepository
  }
});

// Initialize the database and load sites
await databaseManager.initialize();

// Export application data
const exportData = await databaseManager.exportData();
```

## Constructors

### Constructor

> **new DatabaseManager**(`dependencies`): `DatabaseManager`

Defined in: [electron/managers/DatabaseManager.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L95)

#### Parameters

##### dependencies

[`DatabaseManagerDependencies`](../interfaces/DatabaseManagerDependencies.md)

#### Returns

`DatabaseManager`

## Methods

### downloadBackup()

> **downloadBackup**(): `Promise`\<\` `buffer`: `Buffer`; `fileName`: `string`; \`\>

Defined in: [electron/managers/DatabaseManager.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L104)

Download SQLite database backup.

#### Returns

`Promise`\<\` `buffer`: `Buffer`; `fileName`: `string`; \`\>

***

### exportData()

> **exportData**(): `Promise`\<`string`\>

Defined in: [electron/managers/DatabaseManager.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L126)

Export all application data to JSON string.

#### Returns

`Promise`\<`string`\>

***

### getHistoryLimit()

> **getHistoryLimit**(): `number`

Defined in: [electron/managers/DatabaseManager.ts:157](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L157)

Get current history limit.

#### Returns

`number`

Current history limit value

***

### importData()

> **importData**(`data`): `Promise`\<`boolean`\>

Defined in: [electron/managers/DatabaseManager.ts:203](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L203)

Import data from JSON string with comprehensive error handling.

#### Parameters

##### data

`string`

JSON string containing import data

#### Returns

`Promise`\<`boolean`\>

Promise resolving to success status

#### Remarks

**Error Handling Pattern:**
This method demonstrates the standard error handling pattern used throughout
the application: `withErrorHandling()` + `.catch()` chaining.

- **withErrorHandling()**: Provides standardized error logging and debugging
- **.catch()**: Provides method-specific recovery behavior (events, fallbacks)

**Why This Pattern:**
1. **Separation of Concerns**: withErrorHandling handles logging/debugging
2. **Custom Recovery**: .catch() handles method-specific failure behavior
3. **Event Consistency**: Ensures failure events are always emitted
4. **Type Safety**: Maintains return type contracts (boolean/specific types)

**Usage Guidelines:**
- Use withErrorHandling for all async operations that need error logging
- Chain .catch() when you need custom recovery behavior
- Always emit failure events in .catch() for observability
- Return appropriate fallback values (false, empty arrays, etc.)

#### Example

```typescript
// Standard pattern used throughout the application
return withErrorHandling(
  async () => {
    // Main operation logic
    return successResult;
  },
  { logger, operationName: "operation description" }
).catch(async (error) => {
  // Method-specific recovery logic
  await this.emitFailureEvent();
  return fallbackValue;
});
```

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [electron/managers/DatabaseManager.ts:258](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L258)

Initialize the database and load sites.

#### Returns

`Promise`\<`void`\>

***

### refreshSites()

> **refreshSites**(): `Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/managers/DatabaseManager.ts:310](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L310)

Refresh sites from database and update cache.

#### Returns

`Promise`\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to array of sites

***

### setHistoryLimit()

> **setHistoryLimit**(`limit`): `Promise`\<`void`\>

Defined in: [electron/managers/DatabaseManager.ts:348](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/DatabaseManager.ts#L348)

Set history limit for monitor data retention.

#### Parameters

##### limit

`number`

Number of history records to retain (must be non-negative integer, 0 disables history tracking)

#### Returns

`Promise`\<`void`\>

#### Throws

Error if limit is not a valid non-negative integer
