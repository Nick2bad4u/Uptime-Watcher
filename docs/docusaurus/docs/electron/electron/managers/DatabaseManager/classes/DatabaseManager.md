# Class: DatabaseManager

Defined in: [electron/managers/DatabaseManager.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L103)

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

Defined in: [electron/managers/DatabaseManager.ts:170](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L170)

Constructs a new DatabaseManager instance.

#### Parameters

##### dependencies

[`DatabaseManagerDependencies`](../interfaces/DatabaseManagerDependencies.md)

The set of dependencies required for all database operations.

#### Returns

`DatabaseManager`

#### Remarks

All dependencies are injected for testability and modularity. Services and orchestrators are created using the provided repositories and event emitter.

## Methods

### downloadBackup()

> **downloadBackup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/managers/DatabaseManager.ts:211](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L211)

Downloads a SQLite database backup file.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

A promise resolving to an object containing the backup buffer and file name.

#### Remarks

Uses the command pattern to execute a backup operation and returns the backup buffer and file name.

#### Throws

Error if backup creation or file system operations fail.

#### Example

```typescript
const backup = await databaseManager.downloadBackup();
// Use backup.buffer and backup.fileName
```

***

### exportData()

> **exportData**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/managers/DatabaseManager.ts:230](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L230)

Exports all application data to a JSON string.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

A promise resolving to a JSON string containing all exported data.

#### Remarks

Uses the command pattern to serialize all application data for backup or migration.

#### Throws

Error if database access or data serialization fails.

#### Example

```typescript
const exportData = await databaseManager.exportData();
```

***

### getHistoryLimit()

> **getHistoryLimit**(): `number`

Defined in: [electron/managers/DatabaseManager.ts:240](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L240)

Gets the current history limit for status history retention.

#### Returns

`number`

The current history limit value.

***

### importData()

> **importData**(`data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/DatabaseManager.ts:253](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L253)

Imports data from a JSON string with comprehensive error handling.

#### Parameters

##### data

`string`

The JSON string containing import data.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

A promise resolving to a boolean indicating success.

#### Remarks

Uses the standard error handling pattern: [withErrorHandling](../../../../shared/utils/errorHandling/functions/withErrorHandling.md) for logging and debugging, and `.catch()` for method-specific recovery and event emission. Always emits a failure event if import fails.

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/DatabaseManager.ts:287](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L287)

Initializes the database and loads all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when initialization is complete.

#### Remarks

Loads the current history limit from settings, initializes the database, loads all sites, and emits a transaction-completed event. Errors during event emission are logged but do not interrupt initialization.

#### Throws

Error if database initialization, site loading, or settings loading fails.

***

### refreshSites()

> **refreshSites**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/managers/DatabaseManager.ts:340](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L340)

Refreshes sites from the database and updates the cache.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../shared/types/interfaces/Site.md)[]\>

A promise resolving to an array of loaded [Site](../../../../shared/types/interfaces/Site.md) objects.

#### Remarks

Loads all sites from the database, updates the cache, emits a sites-refreshed event, and returns the loaded sites. If an error occurs, emits a sites-refreshed event with zero count and returns an empty array.

#### Throws

Error if database access or cache update fails.

***

### resetSettings()

> **resetSettings**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/DatabaseManager.ts:380](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L380)

Resets all application settings to their default values.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when settings have been reset.

#### Remarks

Resets the history limit and (in the future) other persisted settings to their defaults. The operation is performed within a database transaction for consistency.

***

### setHistoryLimit()

> **setHistoryLimit**(`limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/DatabaseManager.ts:404](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/DatabaseManager.ts#L404)

Sets the history limit for status history retention.

#### Parameters

##### limit

`number`

The new history limit value to set.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the history limit is updated.

#### Remarks

Validates the input and updates the history limit in the database and in memory. Emits a history-limit-updated event on success.

#### Throws

TypeError if limit is not a valid number or integer.

#### Throws

RangeError if limit is negative, infinite, or exceeds the configured maximum.
