# Class: HistoryRepository

Defined in: [electron/services/database/HistoryRepository.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L40)

Repository for managing history data persistence.

Handles all CRUD operations for monitor history in the database, following the repository pattern.

## Remarks

All operations are wrapped in transactions and use the repository pattern for consistency, error handling, and maintainability. This class should be used as the sole interface for history data access and mutation.

## Constructors

### Constructor

> **new HistoryRepository**(`dependencies`): `HistoryRepository`

Defined in: [electron/services/database/HistoryRepository.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L56)

Constructs a new HistoryRepository instance.

#### Parameters

##### dependencies

[`HistoryRepositoryDependencies`](../interfaces/HistoryRepositoryDependencies.md)

The required dependencies for history operations.

#### Returns

`HistoryRepository`

#### Example

```typescript
const repo = new HistoryRepository({ databaseService });
```

## Methods

### addEntry()

> **addEntry**(`monitorId`, `entry`, `details?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L73)

Adds a new history entry for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to add history for.

##### entry

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)

The status history entry to add.

##### details?

`string`

Optional details string for the entry.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the entry is added.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.addEntry("monitor-123", entryObj, "details");
```

***

### addEntryInternal()

> **addEntryInternal**(`db`, `monitorId`, `entry`, `details?`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L97)

Adds a new history entry for a monitor within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### monitorId

`string`

The unique identifier of the monitor to add history for.

##### entry

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)

The status history entry to add.

##### details?

`string`

Optional details string for the entry.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### bulkInsert()

> **bulkInsert**(`monitorId`, `historyEntries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L113)

Bulk inserts history entries for a monitor (used for import functionality).

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to add history for.

##### historyEntries

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md) & `object`[]

Array of status history entries to insert. Each entry may include an optional `details` property.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all entries are inserted.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.bulkInsert("monitor-123", entriesArray);
```

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L168)

Clears all history from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all history is deleted.

#### Throws

Error if the database operation fails.

#### Remarks

**WARNING**: This operation is irreversible and will delete all history data. The operation is wrapped in a transaction for data safety and error handling.

#### Example

```typescript
await repo.deleteAll();
```

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L184)

Clears all history from the database within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context. The operation is destructive and irreversible. Proper error handling is delegated to the calling transaction context.

***

### deleteByMonitorId()

> **deleteByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:199](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L199)

Deletes all history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to delete history for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when history is deleted.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.deleteByMonitorId("monitor-123");
```

***

### deleteByMonitorIdInternal()

> **deleteByMonitorIdInternal**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:221](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L221)

Deletes all history entries for a specific monitor within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### monitorId

`string`

The unique identifier of the monitor to delete history for.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### findByMonitorId()

> **findByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

Defined in: [electron/services/database/HistoryRepository.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L236)

Finds all history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to find history for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

A promise resolving to an array of status history entries.

#### Throws

Error if the database operation fails.

#### Example

```typescript
const entries = await repo.findByMonitorId("monitor-123");
```

***

### getHistoryCount()

> **getHistoryCount**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

Defined in: [electron/services/database/HistoryRepository.ts:256](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L256)

Gets the count of history entries for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

A promise resolving to the number of history entries.

#### Throws

Error if the database operation fails.

#### Remarks

Uses consistent async pattern with error handling for reliability. Wrapped in withDatabaseOperation for proper error recovery.

#### Example

```typescript
const count = await repo.getHistoryCount("monitor-123");
```

***

### getHistoryCountInternal()

> **getHistoryCountInternal**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/HistoryRepository.ts:277](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L277)

Gets the count of history entries for a monitor within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

`number`

The number of history entries for the monitor.

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context. Provides synchronous access for use in transaction-wrapped operations.

***

### getLatestEntry()

> **getLatestEntry**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

Defined in: [electron/services/database/HistoryRepository.ts:294](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L294)

Gets the most recent history entry for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

A promise resolving to the latest history entry, or `undefined` if none exists.

#### Throws

Error if the database operation fails.

#### Remarks

Uses consistent async pattern with error handling for reliability. Wrapped in withDatabaseOperation for proper error recovery.

#### Example

```typescript
const latest = await repo.getLatestEntry("monitor-123");
```

***

### pruneAllHistory()

> **pruneAllHistory**(`limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:317](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L317)

Prunes old history entries for all monitors, keeping only the most recent entries per monitor.

#### Parameters

##### limit

`number`

The maximum number of entries to keep per monitor. Must be greater than 0.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when pruning is complete.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.pruneAllHistory(100);
```

***

### pruneAllHistoryInternal()

> **pruneAllHistoryInternal**(`db`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:359](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L359)

Prunes old history entries for all monitors within an existing transaction context, keeping only the most recent entries per monitor.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### limit

`number`

The maximum number of entries to keep per monitor. Must be greater than 0.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### pruneHistory()

> **pruneHistory**(`monitorId`, `limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:393](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L393)

Prunes old history entries for a specific monitor, keeping only the most recent entries.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to prune history for.

##### limit

`number`

The maximum number of entries to keep. Must be greater than 0.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when pruning is complete.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.pruneHistory("monitor-123", 100);
```

***

### pruneHistoryInternal()

> **pruneHistoryInternal**(`db`, `monitorId`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:415](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/HistoryRepository.ts#L415)

Prunes old history entries for a specific monitor within an existing transaction context, keeping only the most recent entries.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### monitorId

`string`

The unique identifier of the monitor to prune history for.

##### limit

`number`

The maximum number of entries to keep. Must be greater than 0.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.
