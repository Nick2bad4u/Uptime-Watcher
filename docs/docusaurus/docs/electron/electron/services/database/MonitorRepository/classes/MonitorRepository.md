# Class: MonitorRepository

Defined in: [electron/services/database/MonitorRepository.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L25)

## Constructors

### Constructor

> **new MonitorRepository**(`dependencies`): `MonitorRepository`

Defined in: [electron/services/database/MonitorRepository.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L28)

#### Parameters

##### dependencies

[`MonitorRepositoryDependencies`](../interfaces/MonitorRepositoryDependencies.md)

#### Returns

`MonitorRepository`

## Methods

### bulkCreate()

> **bulkCreate**(`siteIdentifier`, `monitors`): `Promise`\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Defined in: [electron/services/database/MonitorRepository.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L37)

Bulk create monitors (for import functionality).
Returns the created monitor with their new IDs.
Uses transactions to ensure atomicity.

#### Parameters

##### siteIdentifier

`string`

##### monitors

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

#### Returns

`Promise`\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

***

### create()

> **create**(`siteIdentifier`, `monitor`): `Promise`\<`string`\>

Defined in: [electron/services/database/MonitorRepository.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L83)

Create a new monitor and return its ID.
Uses transactions to ensure atomicity.

#### Parameters

##### siteIdentifier

`string`

##### monitor

`Omit`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\], `"id"`\>

#### Returns

`Promise`\<`string`\>

***

### createInternal()

> **createInternal**(`db`, `siteIdentifier`, `monitor`): `string`

Defined in: [electron/services/database/MonitorRepository.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L110)

Internal method to create a monitor within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### siteIdentifier

`string`

Site identifier to associate monitor with

##### monitor

`Omit`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\], `"id"`\>

Monitor configuration data

#### Returns

`string`

Generated monitor ID as string

#### Throws

Error When monitor creation fails or returns invalid ID

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.
Uses enhanced type safety validation to prevent silent failures from schema changes.

***

### delete()

> **delete**(`monitorId`): `Promise`\<`boolean`\>

Defined in: [electron/services/database/MonitorRepository.ts:142](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L142)

Delete a monitor and its history.
Uses a transaction to ensure atomicity.

#### Parameters

##### monitorId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### deleteAll()

> **deleteAll**(): `Promise`\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L169)

Clear all monitors from the database.
Uses transactions to ensure atomicity.

#### Returns

`Promise`\<`void`\>

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:182](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L182)

Internal method to clear all monitors from the database within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

#### Returns

`void`

***

### deleteBySiteIdentifier()

> **deleteBySiteIdentifier**(`siteIdentifier`): `Promise`\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:191](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L191)

Delete all monitors for a specific site.
Uses a transaction to ensure atomicity.

#### Parameters

##### siteIdentifier

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteBySiteIdentifierInternal()

> **deleteBySiteIdentifierInternal**(`db`, `siteIdentifier`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:213](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L213)

Internal method to delete all monitors for a specific site within an existing transaction.
This method should be called from within a database transaction.

#### Parameters

##### db

`Database`

##### siteIdentifier

`string`

#### Returns

`void`

***

### deleteInternal()

> **deleteInternal**(`db`, `monitorId`): `boolean`

Defined in: [electron/services/database/MonitorRepository.ts:232](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L232)

Internal method to delete a monitor and its history within an existing transaction.
This method should be called from within a database transaction.

#### Parameters

##### db

`Database`

##### monitorId

`string`

#### Returns

`boolean`

***

### findByIdentifier()

> **findByIdentifier**(`monitorId`): `Promise`\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

Defined in: [electron/services/database/MonitorRepository.ts:244](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L244)

Find a monitor by its identifier with resilient error handling.

#### Parameters

##### monitorId

`string`

#### Returns

`Promise`\<`undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)\>

***

### findBySiteIdentifier()

> **findBySiteIdentifier**(`siteIdentifier`): `Promise`\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Defined in: [electron/services/database/MonitorRepository.ts:266](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L266)

Find all monitors for a specific site.

#### Parameters

##### siteIdentifier

`string`

Site identifier to find monitors for

#### Returns

`Promise`\<[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]\>

Promise resolving to array of monitors for the site

***

### getAllMonitorIds()

> **getAllMonitorIds**(): `Promise`\<`object`[]\>

Defined in: [electron/services/database/MonitorRepository.ts:281](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L281)

Get all monitor IDs.

#### Returns

`Promise`\<`object`[]\>

***

### update()

> **update**(`monitorId`, `monitor`): `Promise`\<`void`\>

Defined in: [electron/services/database/MonitorRepository.ts:293](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L293)

Update an existing monitor.
Uses transactions to ensure atomicity.

#### Parameters

##### monitorId

`string`

##### monitor

`Partial`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

#### Returns

`Promise`\<`void`\>

***

### updateInternal()

> **updateInternal**(`db`, `monitorId`, `monitor`): `void`

Defined in: [electron/services/database/MonitorRepository.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/MonitorRepository.ts#L326)

Update an existing monitor (internal version for use within existing transactions).

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### monitorId

`string`

ID of monitor to update

##### monitor

`Partial`\<[`Site`](../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

Partial monitor data to update

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.

**Field Mapping Logic:**
Converts camelCase field names to snake_case database columns using dynamic mapping.
Only updates fields that are provided and are primitive types (string, number, boolean).

**Domain-Specific Behavior**:
The 'enabled' field is automatically derived from 'monitoring' state per domain contract.
If neither 'monitoring' nor 'enabled' are provided, the 'enabled' field is skipped
to preserve the current monitoring state (see shouldSkipMonitoringFields).
