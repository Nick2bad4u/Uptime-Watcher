# Class: MonitorRepository

Defined in: [electron/services/database/MonitorRepository.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L72)

Repository for managing monitor data persistence.

## Remarks

Handles all CRUD operations for monitors in the database using the repository pattern.
All mutations are wrapped in transactions for consistency and error handling.
All operations use the DatabaseService for transaction management and maintain atomicity.

## Constructors

### Constructor

> **new MonitorRepository**(`dependencies`): `MonitorRepository`

Defined in: [electron/services/database/MonitorRepository.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L85)

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

Defined in: [electron/services/database/MonitorRepository.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L103)

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

#### Throws

Error if the database operation fails or monitor creation fails.

#### Remarks

Uses a transaction for atomicity. Each monitor is inserted and its ID is returned.

#### Example

```typescript
await repo.bulkCreate("site-123", monitorsArray);
```

***

### create()

> **create**(`siteIdentifier`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/services/database/MonitorRepository.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L161)

Creates a new monitor for a site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to associate the monitor with.

##### monitor

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\], `"id"`\>

Monitor configuration data (without ID).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to the created monitor ID as string.

#### Throws

Error if the database operation fails or monitor creation fails.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
const id = await repo.create("site-123", monitorObj);
```

***

### createInternal()

> **createInternal**(`db`, `siteIdentifier`, `monitor`): `string`

Defined in: [electron/services/database/MonitorRepository.ts:185](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L185)

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

#### Throws

Error when monitor creation fails or returns invalid ID.

#### Remarks

Must be called within an active transaction context.

***

### delete()

> **delete**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/database/MonitorRepository.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L226)

Deletes a monitor and its history.

#### Parameters

##### monitorId

`string`

The monitor ID to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if deleted, false otherwise.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a transaction for atomicity. History is deleted before monitor.

#### Example

```typescript
const deleted = await repo.delete("monitor-123");
```

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:261](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L261)

Clears all monitors from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all monitors are deleted.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
await repo.deleteAll();
```

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:278](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L278)

Internal method to clear all monitors from the database within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

#### Returns

`void`

void

#### Remarks

Use this method when already within a transaction context.

***

### deleteBySiteIdentifier()

> **deleteBySiteIdentifier**(`siteIdentifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:296](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L296)

Deletes all monitors for a specific site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to delete monitors for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all monitors are deleted for the site.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a transaction for atomicity.

#### Example

```typescript
await repo.deleteBySiteIdentifier("site-123");
```

***

### deleteBySiteIdentifierInternal()

> **deleteBySiteIdentifierInternal**(`db`, `siteIdentifier`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:323](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L323)

Internal method to delete all monitors for a specific site within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### siteIdentifier

`string`

The site identifier to delete monitors for.

#### Returns

`void`

void

#### Remarks

Deletes all history for monitors before deleting monitors.

***

### deleteInternal()

> **deleteInternal**(`db`, `monitorId`): `boolean`

Defined in: [electron/services/database/MonitorRepository.ts:347](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L347)

Internal method to delete a monitor and its history within an existing transaction.

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

### findByIdentifier()

> **findByIdentifier**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

Defined in: [electron/services/database/MonitorRepository.ts:369](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L369)

Finds a monitor by its unique identifier.

#### Parameters

##### monitorId

`string`

The unique identifier of the monitor to find.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

A promise resolving to the monitor object, or `undefined` if not found.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a direct database query and maps the result to a monitor object.

#### Example

```typescript
const monitor = await repo.findByIdentifier("monitor-123");
```

***

### findBySiteIdentifier()

> **findBySiteIdentifier**(`siteIdentifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Defined in: [electron/services/database/MonitorRepository.ts:396](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L396)

Finds all monitors for a specific site.

#### Parameters

##### siteIdentifier

`string`

The site identifier to find monitors for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

A promise resolving to an array of monitor objects.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a direct database query and maps the results to monitor objects.

#### Example

```typescript
const monitors = await repo.findBySiteIdentifier("site-123");
```

***

### getAllMonitorIds()

> **getAllMonitorIds**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Defined in: [electron/services/database/MonitorRepository.ts:417](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L417)

Gets all monitor IDs in the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

A promise resolving to an array of objects with monitor IDs.

#### Throws

Error if the database operation fails.

#### Remarks

Returns all monitor IDs as objects with an `id` property.

#### Example

```typescript
const ids = await repo.getAllMonitorIds();
```

***

### update()

> **update**(`monitorId`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:439](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L439)

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

#### Throws

Error if the database operation fails.

#### Remarks

Only provided fields are updated. Uses a transaction for atomicity.

#### Example

```typescript
await repo.update("monitor-123", { checkInterval: 60000 });
```

***

### updateInternal()

> **updateInternal**(`db`, `monitorId`, `monitor`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:463](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/MonitorRepository.ts#L463)

Updates a monitor's configuration within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### monitorId

`string`

The unique identifier of the monitor to update.

##### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

Partial monitor configuration data to update.

#### Returns

`void`

#### Throws

Error if the update query fails.

#### Remarks

Only provided fields are updated. Converts camelCase to snake_case for DB columns. Use this method only when already within a transaction context.
