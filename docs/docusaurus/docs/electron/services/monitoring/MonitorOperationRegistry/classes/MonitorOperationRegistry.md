# Class: MonitorOperationRegistry

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L70)

Registry for tracking active monitoring operations.

## Remarks

Provides operation correlation and cancellation capabilities to prevent race
conditions between monitor state changes and check operations.

## Constructors

### Constructor

> **new MonitorOperationRegistry**(): `MonitorOperationRegistry`

#### Returns

`MonitorOperationRegistry`

## Methods

### cancelOperations()

> **cancelOperations**(`monitorId`): `void`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L81)

Cancel all operations for a specific monitor.

#### Parameters

##### monitorId

`string`

ID of monitor to cancel operations for

#### Returns

`void`

***

### completeOperation()

> **completeOperation**(`operationId`): `void`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L105)

Complete and remove an operation from the registry.

#### Parameters

##### operationId

`string`

ID of operation to complete

#### Returns

`void`

***

### getActiveOperations()

> **getActiveOperations**(): [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`MonitorCheckOperation`](../interfaces/MonitorCheckOperation.md)\>

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L126)

Get all active operations (for cleanup purposes).

#### Returns

[`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`MonitorCheckOperation`](../interfaces/MonitorCheckOperation.md)\>

Map of all active operations

***

### getOperation()

> **getOperation**(`operationId`): `undefined` \| [`MonitorCheckOperation`](../interfaces/MonitorCheckOperation.md)

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L137)

Get a specific operation by ID.

#### Parameters

##### operationId

`string`

ID of operation to retrieve

#### Returns

`undefined` \| [`MonitorCheckOperation`](../interfaces/MonitorCheckOperation.md)

Operation if found, undefined otherwise

***

### initiateCheck()

> **initiateCheck**(`monitorId`): `string`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L150)

Initiate a new check operation for a monitor.

#### Parameters

##### monitorId

`string`

ID of monitor to check

#### Returns

`string`

Unique operation ID

***

### validateOperation()

> **validateOperation**(`operationId`): `boolean`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:187](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L187)

Validate that an operation is still active and not cancelled.

#### Parameters

##### operationId

`string`

ID of operation to validate

#### Returns

`boolean`

True if operation is valid and not cancelled
