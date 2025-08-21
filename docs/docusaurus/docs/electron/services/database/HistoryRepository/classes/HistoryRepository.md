# Class: HistoryRepository

Defined in: [electron/services/database/HistoryRepository.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L123)

Repository for managing history data persistence.

Handles all CRUD operations for monitor history in the database, following
the repository pattern.

## Remarks

All operations are wrapped in transactions and use the repository pattern for
consistency, error handling, and maintainability. This class should be used
as the sole interface for history data access and mutation.

## Constructors

### Constructor

> **new HistoryRepository**(`dependencies`): `HistoryRepository`

Defined in: [electron/services/database/HistoryRepository.ts:480](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L480)

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

Defined in: [electron/services/database/HistoryRepository.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L149)

Adds a new history entry for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to add history
  for.

##### entry

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)

The status history entry to add.

##### details?

`string`

Optional details string for the entry.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the entry is added.

#### Example

```typescript
await repo.addEntry("monitor-123", entryObj, "details");
```

#### Throws

Error if the database operation fails.

***

### bulkInsert()

> **bulkInsert**(`monitorId`, `historyEntries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:185](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L185)

Bulk inserts history entries for a monitor (used for import
functionality).

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to add history
  for.

##### historyEntries

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md) & `object`[]

Array of status history entries to insert. Each
  entry may include an optional `details` property.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all entries are inserted.

#### Example

```typescript
await repo.bulkInsert("monitor-123", entriesArray);
```

#### Throws

Error if the database operation fails.

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:244](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L244)

Clears all history from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all history is deleted.

#### Remarks

**WARNING**: This operation is irreversible and will delete all history
data. The operation is wrapped in a transaction for data safety and error
handling.

#### Example

```typescript
await repo.deleteAll();
```

#### Throws

Error if the database operation fails.

***

### deleteByMonitorId()

> **deleteByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:271](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L271)

Deletes all history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to delete history
  for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when history is deleted.

#### Example

```typescript
await repo.deleteByMonitorId("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### findByMonitorId()

> **findByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

Defined in: [electron/services/database/HistoryRepository.ts:300](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L300)

Finds all history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to find history
  for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

A promise resolving to an array of status history entries.

#### Example

```typescript
const entries = await repo.findByMonitorId("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### getHistoryCount()

> **getHistoryCount**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

Defined in: [electron/services/database/HistoryRepository.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L326)

Gets the count of history entries for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

A promise resolving to the number of history entries.

#### Remarks

Uses consistent async pattern with error handling for reliability.
Wrapped in withDatabaseOperation for proper error recovery.

#### Example

```typescript
const count = await repo.getHistoryCount("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### getLatestEntry()

> **getLatestEntry**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

Defined in: [electron/services/database/HistoryRepository.ts:358](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L358)

Gets the most recent history entry for a monitor.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

A promise resolving to the latest history entry, or `undefined`
  if none exists.

#### Remarks

Uses consistent async pattern with error handling for reliability.
Wrapped in withDatabaseOperation for proper error recovery.

#### Example

```typescript
const latest = await repo.getLatestEntry("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### pruneAllHistory()

> **pruneAllHistory**(`limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:389](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L389)

Prunes old history entries for all monitors, keeping only the most recent
entries per monitor.

#### Parameters

##### limit

`number`

The maximum number of entries to keep per monitor. Must be
  greater than 0.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when pruning is complete.

#### Example

```typescript
await repo.pruneAllHistory(100);
```

#### Throws

Error if the database operation fails.

***

### pruneHistory()

> **pruneHistory**(`monitorId`, `limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:456](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L456)

Prunes old history entries for a specific monitor, keeping only the most
recent entries.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to prune history
  for.

##### limit

`number`

The maximum number of entries to keep. Must be greater
  than 0.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when pruning is complete.

#### Example

```typescript
await repo.pruneHistory("monitor-123", 100);
```

#### Throws

Error if the database operation fails.

***

### addEntryInternal()

> **addEntryInternal**(`db`, `monitorId`, `entry`, `details?`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:498](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L498)

Adds a new history entry for a monitor within an existing transaction
context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### monitorId

`string`

The unique identifier of the monitor to add history
  for.

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

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:519](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L519)

Clears all history from the database within an existing transaction
context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction
context. The operation is destructive and irreversible. Proper error
handling is delegated to the calling transaction context.

***

### deleteByMonitorIdInternal()

> **deleteByMonitorIdInternal**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:535](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L535)

Deletes all history entries for a specific monitor within an existing
transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### monitorId

`string`

The unique identifier of the monitor to delete history
  for.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### getHistoryCountInternal()

> **getHistoryCountInternal**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/HistoryRepository.ts:554](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L554)

Gets the count of history entries for a monitor within an existing
transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### monitorId

`string`

The unique identifier of the monitor.

#### Returns

`number`

The number of history entries for the monitor.

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction
context. Provides synchronous access for use in transaction-wrapped
operations.

***

### pruneAllHistoryInternal()

> **pruneAllHistoryInternal**(`db`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:570](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L570)

Prunes old history entries for all monitors within an existing
transaction context, keeping only the most recent entries per monitor.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### limit

`number`

The maximum number of entries to keep per monitor. Must be
  greater than 0.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### pruneHistoryInternal()

> **pruneHistoryInternal**(`db`, `monitorId`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:615](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/HistoryRepository.ts#L615)

Prunes old history entries for a specific monitor within an existing
transaction context, keeping only the most recent entries.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### monitorId

`string`

The unique identifier of the monitor to prune history
  for.

##### limit

`number`

The maximum number of entries to keep. Must be greater
  than 0.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.
