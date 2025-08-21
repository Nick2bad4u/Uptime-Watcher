# Class: MonitorRepository

Defined in: [electron/services/database/MonitorRepository.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L129)

## Remarks

Handles all CRUD operations for monitors in the database using the repository
pattern. All mutations are wrapped in transactions for consistency and error
handling. All operations use the DatabaseService for transaction management
and maintain atomicity.

Repository for managing monitor data persistence.

## Constructors

### Constructor

> **new MonitorRepository**(`dependencies`): `MonitorRepository`

Defined in: [electron/services/database/MonitorRepository.ts:517](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L517)

Constructs a new MonitorRepository instance.

#### Parameters

##### dependencies

[`MonitorRepositoryDependencies`](../interfaces/MonitorRepositoryDependencies.md)

The required dependencies for monitor operations.

#### Returns

`MonitorRepository`

#### Example

```typescript
const repo = new MonitorRepository({ databaseService });
```

## Methods

### bulkCreate()

> **bulkCreate**(`siteIdentifier`, `monitors`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Defined in: [electron/services/database/MonitorRepository.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L153)

Bulk creates monitors for a site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to associate monitors with.

##### monitors

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

Array of monitor configuration objects to create.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Promise resolving to array of created monitors with IDs.

#### Remarks

Uses a transaction for atomicity. Each monitor is inserted and its ID is
returned.

#### Example

```typescript
await repo.bulkCreate("site-123", monitorsArray);
```

#### Throws

Error if the database operation fails or monitor creation fails.

***

### clearActiveOperations()

> **clearActiveOperations**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:218](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L218)

Clears all active operations for a monitor.

#### Parameters

##### monitorId

`string`

The ID of the monitor to clear operations for

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all operations are cleared

#### Remarks

This method is used when a monitor is stopped or reset to ensure no stale
operations remain active. Use only for standalone operations. For
operations within existing transactions, use
clearActiveOperationsInternal.

#### Throws

Error if the database operation fails

***

### create()

> **create**(`siteIdentifier`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/services/database/MonitorRepository.ts:249](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L249)

Creates a new monitor for a site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to associate the monitor
  with.

##### monitor

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\], `"id"`\>

Monitor configuration data (without ID).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to the created monitor ID as string.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
const id = await repo.create("site-123", monitorObj);
```

#### Throws

Error if the database operation fails or monitor creation fails.

***

### delete()

> **delete**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/database/MonitorRepository.ts:284](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L284)

Deletes a monitor and its history.

#### Parameters

##### monitorId

`string`

The monitor ID to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if deleted, false otherwise.

#### Remarks

Uses a transaction for atomicity. History is deleted before monitor.

#### Example

```typescript
const deleted = await repo.delete("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L326)

Clears all monitors from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all monitors are deleted.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
await repo.deleteAll();
```

#### Throws

Error if the database operation fails.

***

### deleteBySiteIdentifier()

> **deleteBySiteIdentifier**(`siteIdentifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:356](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L356)

Deletes all monitors for a specific site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to delete monitors for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all monitors are deleted for the
  site.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
await repo.deleteBySiteIdentifier("site-123");
```

#### Throws

Error if the database operation fails.

***

### findByIdentifier()

> **findByIdentifier**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

Defined in: [electron/services/database/MonitorRepository.ts:394](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L394)

Finds a monitor by its unique identifier.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to find.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

A promise resolving to the monitor object, or `undefined` if not
  found.

#### Remarks

Uses a direct database query and maps the result to a monitor object.

#### Example

```typescript
const monitor = await repo.findByIdentifier("monitor-123");
```

#### Throws

Error if the database operation fails.

***

### findBySiteIdentifier()

> **findBySiteIdentifier**(`siteIdentifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Defined in: [electron/services/database/MonitorRepository.ts:432](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L432)

Finds all monitors for a specific site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to find monitors for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

A promise resolving to an array of monitor objects.

#### Remarks

Uses a direct database query and maps the results to monitor objects.

#### Example

```typescript
const monitors = await repo.findBySiteIdentifier("site-123");
```

#### Throws

Error if the database operation fails.

***

### getAllMonitorIds()

> **getAllMonitorIds**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Defined in: [electron/services/database/MonitorRepository.ts:463](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L463)

Gets all monitor IDs in the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

A promise resolving to an array of objects with monitor IDs.

#### Remarks

Returns all monitor IDs as objects with an `id` property.

#### Example

```typescript
const ids = await repo.getAllMonitorIds();
```

#### Throws

Error if the database operation fails.

***

### update()

> **update**(`monitorId`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:490](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L490)

Updates a monitor's configuration.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to update.

##### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

Partial monitor configuration data to update.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the update is complete.

#### Remarks

Only provided fields are updated. Uses a transaction for atomicity.

#### Example

```typescript
await repo.update("monitor-123", { checkInterval: 60000 });
```

#### Throws

Error if the database operation fails.

***

### clearActiveOperationsInternal()

> **clearActiveOperationsInternal**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:530](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L530)

Internal method to clear all active operations for a monitor. Must be
called within an active transaction.

#### Parameters

##### db

`Database`

Database connection within active transaction

##### monitorId

`string`

The ID of the monitor to clear operations for

#### Returns

`void`

***

### createInternal()

> **createInternal**(`db`, `siteIdentifier`, `monitor`): `string`

Defined in: [electron/services/database/MonitorRepository.ts:559](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L559)

Internal method to create a monitor within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### siteIdentifier

`string`

Site identifier to associate monitor with.

##### monitor

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\], `"id"`\>

Monitor configuration data (without ID).

#### Returns

`string`

Generated monitor ID as string.

#### Remarks

Must be called within an active transaction context.

#### Throws

Error when monitor creation fails or returns invalid ID.

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:609](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L609)

Internal method to clear all monitors from the database within an
existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

#### Returns

`void`

Void

#### Remarks

Use this method when already within a transaction context.

***

### deleteBySiteIdentifierInternal()

> **deleteBySiteIdentifierInternal**(`db`, `siteIdentifier`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:626](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L626)

Internal method to delete all monitors for a specific site within an
existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### siteIdentifier

`string`

The site identifier to delete monitors for.

#### Returns

`void`

Void

#### Remarks

Deletes all history for monitors before deleting monitors.

***

### deleteInternal()

> **deleteInternal**(`db`, `monitorId`): `boolean`

Defined in: [electron/services/database/MonitorRepository.ts:658](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L658)

Internal method to delete a monitor and its history within an existing
transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### monitorId

`string`

The monitor ID to delete.

#### Returns

`boolean`

True if deleted, false otherwise.

#### Remarks

Deletes history before deleting monitor.

***

### updateInternal()

> **updateInternal**(`db`, `monitorId`, `monitor`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:681](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/MonitorRepository.ts#L681)

Updates a monitor's configuration within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### monitorId

`string`

The unique identifier of the monitor to update.

##### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

Partial monitor configuration data to update.

#### Returns

`void`

#### Remarks

Only provided fields are updated. Converts camelCase to snake_case for DB
columns. Use this method only when already within a transaction context.

#### Throws

Error if the update query fails.
