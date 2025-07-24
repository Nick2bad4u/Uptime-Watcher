# Class: HistoryRepository

Defined in: [electron/services/database/HistoryRepository.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L24)

## Constructors

### Constructor

> **new HistoryRepository**(`dependencies`): `HistoryRepository`

Defined in: [electron/services/database/HistoryRepository.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L27)

#### Parameters

##### dependencies

[`HistoryRepositoryDependencies`](../interfaces/HistoryRepositoryDependencies.md)

#### Returns

`HistoryRepository`

## Methods

### addEntry()

> **addEntry**(`monitorId`, `entry`, `details?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L34)

Add a new history entry for a monitor.

#### Parameters

##### monitorId

`string`

##### entry

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)

##### details?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### addEntryInternal()

> **addEntryInternal**(`db`, `monitorId`, `entry`, `details?`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L52)

Internal method to add a new history entry for a monitor within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### monitorId

`string`

##### entry

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)

##### details?

`string`

#### Returns

`void`

***

### bulkInsert()

> **bulkInsert**(`monitorId`, `historyEntries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L59)

Bulk insert history entries (for import functionality).

#### Parameters

##### monitorId

`string`

##### historyEntries

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md) & `object`[]

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L109)

Clear all history from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

**WARNING**: This operation is irreversible and will delete all history data.
Now properly wrapped in transaction for data safety and error handling.

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:128](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L128)

Internal method to clear all history from the database within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.
The operation is destructive and irreversible. Proper error handling is
delegated to the calling transaction context.

***

### deleteByMonitorId()

> **deleteByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L135)

Delete history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### deleteByMonitorIdInternal()

> **deleteByMonitorIdInternal**(`db`, `monitorId`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L153)

Internal method to delete history entries for a specific monitor within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### monitorId

`string`

#### Returns

`void`

***

### findByMonitorId()

> **findByMonitorId**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

Defined in: [electron/services/database/HistoryRepository.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L160)

Find all history entries for a specific monitor.

#### Parameters

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]\>

***

### getHistoryCount()

> **getHistoryCount**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

Defined in: [electron/services/database/HistoryRepository.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L177)

Get the count of history entries for a monitor.

#### Parameters

##### monitorId

`string`

Unique identifier for the monitor

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`number`\>

Promise resolving to the number of history entries

#### Remarks

Uses consistent async pattern with error handling for reliability.
Wrapped in withDatabaseOperation for proper error recovery.

***

### getHistoryCountInternal()

> **getHistoryCountInternal**(`db`, `monitorId`): `number`

Defined in: [electron/services/database/HistoryRepository.ts:200](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L200)

Get the count of history entries for a monitor (internal version for use within transactions).

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### monitorId

`string`

Unique identifier for the monitor

#### Returns

`number`

The number of history entries

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.
Provides synchronous access for use in transaction-wrapped operations.

***

### getLatestEntry()

> **getLatestEntry**(`monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

Defined in: [electron/services/database/HistoryRepository.ts:214](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L214)

Get the most recent history entry for a monitor.

#### Parameters

##### monitorId

`string`

Unique identifier for the monitor

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)\>

Promise resolving to the latest history entry, or undefined if none exists

#### Remarks

Uses consistent async pattern with error handling for reliability.
Wrapped in withDatabaseOperation for proper error recovery.

***

### pruneAllHistory()

> **pruneAllHistory**(`limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L229)

Prune old history entries for all monitors.

#### Parameters

##### limit

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### pruneAllHistoryInternal()

> **pruneAllHistoryInternal**(`db`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:262](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L262)

Internal method to prune old history entries for all monitors within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### limit

`number`

#### Returns

`void`

***

### pruneHistory()

> **pruneHistory**(`monitorId`, `limit`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/HistoryRepository.ts:283](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L283)

Prune old history entries for a monitor, keeping only the most recent entries.

#### Parameters

##### monitorId

`string`

##### limit

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### pruneHistoryInternal()

> **pruneHistoryInternal**(`db`, `monitorId`, `limit`): `void`

Defined in: [electron/services/database/HistoryRepository.ts:300](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/HistoryRepository.ts#L300)

Internal method to prune old history entries for a specific monitor within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### monitorId

`string`

##### limit

`number`

#### Returns

`void`
