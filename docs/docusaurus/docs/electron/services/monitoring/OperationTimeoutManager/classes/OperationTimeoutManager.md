# Class: OperationTimeoutManager

Defined in: [electron/services/monitoring/OperationTimeoutManager.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/OperationTimeoutManager.ts#L29)

Manages timeouts for monitoring operations.

## Remarks

Provides automatic cleanup of operations that exceed their timeout period,
preventing resource leaks and ensuring system stability.

## Constructors

### Constructor

> **new OperationTimeoutManager**(`operationRegistry`): `OperationTimeoutManager`

Defined in: [electron/services/monitoring/OperationTimeoutManager.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/OperationTimeoutManager.ts#L42)

Creates a new OperationTimeoutManager.

#### Parameters

##### operationRegistry

[`MonitorOperationRegistry`](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md)

Registry for managing operations

#### Returns

`OperationTimeoutManager`

## Methods

### clearTimeout()

> **clearTimeout**(`operationId`): `void`

Defined in: [electron/services/monitoring/OperationTimeoutManager.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/OperationTimeoutManager.ts#L51)

Clear a timeout for a specific operation.

#### Parameters

##### operationId

`string`

ID of operation to clear timeout for

#### Returns

`void`

***

### scheduleTimeout()

> **scheduleTimeout**(`operationId`, `timeoutMs`): `void`

Defined in: [electron/services/monitoring/OperationTimeoutManager.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/OperationTimeoutManager.ts#L66)

Schedule a timeout for an operation.

#### Parameters

##### operationId

`string`

ID of operation to timeout

##### timeoutMs

`number`

Timeout duration in milliseconds

#### Returns

`void`
