# Interface: StatusUpdateMonitorCheckResult

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L34)

Unified monitor check result interface for status updates.

## Remarks

This interface combines operation correlation fields with monitor check
results. Used by the status update service to validate and apply status
changes. Includes all fields from both registry and service interfaces.

## Properties

### details?

> `optional` **details**: `string`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L36)

Optional human-readable details

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L38)

Optional error message

***

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L40)

Monitor that was checked

***

### operationId

> **operationId**: `string`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L42)

Links to operation for validation

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L44)

Response time in milliseconds

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L46)

Check result status

***

### timestamp

> **timestamp**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [electron/services/monitoring/MonitorStatusUpdateService.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorStatusUpdateService.ts#L48)

When check completed
