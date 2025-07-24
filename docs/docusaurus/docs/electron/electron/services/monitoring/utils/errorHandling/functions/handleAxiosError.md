# Function: handleAxiosError()

> **handleAxiosError**(`error`, `url`, `responseTime`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/errorHandling.ts#L52)

Handle Axios-specific errors during HTTP monitoring.

## Parameters

### error

`AxiosError`

Axios error instance containing request/response details

### url

`string`

The URL that was being monitored when error occurred

### responseTime

`number`

Response time in milliseconds at point of failure

### correlationId?

`string`

Optional correlation ID for event tracking

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Standardized monitor check result for the network error

## Remarks

With validateStatus: () =\> true configuration, this primarily handles
network errors like timeouts, DNS failures, connection refused, etc.
HTTP response errors are handled in the success path for manual evaluation.
