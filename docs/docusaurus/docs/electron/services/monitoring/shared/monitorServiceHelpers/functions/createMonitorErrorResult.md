# Function: createMonitorErrorResult()

> **createMonitorErrorResult**(`error`, `responseTime`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/shared/monitorServiceHelpers.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/shared/monitorServiceHelpers.ts#L26)

Create a standardized error result for monitor health checks

## Parameters

### error

`string`

Error message

### responseTime

`number` = `0`

Response time in milliseconds

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Standardized monitor health check error result
