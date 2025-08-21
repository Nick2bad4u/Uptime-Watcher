# Interface: MonitorCheckOperation

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L29)

Interface for monitor check operations.

## Remarks

Represents a single monitoring check operation with correlation ID and
cancellation support.

## Properties

### cancelled

> **cancelled**: `boolean`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L31)

Cancellation flag

***

### id

> **id**: `string`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L33)

Unique operation ID

***

### initiatedAt

> **initiatedAt**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L35)

When operation started

***

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L37)

Monitor being checked
