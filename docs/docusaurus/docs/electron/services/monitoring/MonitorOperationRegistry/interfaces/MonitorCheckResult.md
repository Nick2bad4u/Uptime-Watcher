# Interface: MonitorCheckResult

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L48)

Interface for monitor check results.

## Remarks

Links check results back to their originating operation for validation.

## Properties

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L50)

Monitor that was checked

***

### operationId

> **operationId**: `string`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L52)

Links to operation

***

### responseTime?

> `optional` **responseTime**: `number`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L54)

Response time if successful

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L56)

Check result

***

### timestamp

> **timestamp**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [electron/services/monitoring/MonitorOperationRegistry.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorOperationRegistry.ts#L58)

When check completed
