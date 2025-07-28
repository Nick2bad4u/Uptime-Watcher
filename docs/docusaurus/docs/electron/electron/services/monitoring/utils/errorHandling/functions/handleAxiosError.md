# Function: handleAxiosError()

> **handleAxiosError**(`error`, `url`, `responseTime`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/errorHandling.ts#L70)

Handles Axios-specific errors encountered during HTTP monitoring.

## Parameters

### error

`AxiosError`

The AxiosError instance containing request/response details.

### url

`string`

The URL that was being monitored when the error occurred.

### responseTime

`number`

The response time in milliseconds at the point of failure.

### correlationId?

`string`

Optional correlation ID for event tracking and logging.

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

A [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) object representing the network error.

## Remarks

Intended for network errors such as timeouts, DNS failures, or connection refusals. HTTP response errors (status codes) are handled separately in the success path. Always returns a failure result; never throws.

## Example

```typescript
handleAxiosError(error, "https://example.com", 1200, "corr-456");
```

## See

 - AxiosError
 - [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
