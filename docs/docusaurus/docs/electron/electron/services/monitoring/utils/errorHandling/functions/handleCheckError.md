# Function: handleCheckError()

> **handleCheckError**(`error`, `url`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/errorHandling.ts#L82)

Handle errors that occur during health checks with correlation tracking.

## Parameters

### error

`unknown`

Unknown error that occurred during monitoring

### url

`string`

The URL being monitored when error occurred

### correlationId?

`string`

Optional correlation ID for event tracking

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Standardized monitor check result for the error

## Remarks

Attempts to extract response time from Axios errors via declaration merging.
For non-Error objects, uses "Unknown error" as a fallback message since
we cannot guarantee the structure of thrown values in JavaScript.
