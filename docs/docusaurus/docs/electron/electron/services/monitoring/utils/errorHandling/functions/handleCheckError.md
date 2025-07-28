# Function: handleCheckError()

> **handleCheckError**(`error`, `url`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/errorHandling.ts#L106)

Handles unknown errors that occur during health checks, with correlation tracking.

## Parameters

### error

`unknown`

The unknown error thrown during monitoring (can be any type).

### url

`string`

The URL being monitored when the error occurred.

### correlationId?

`string`

Optional correlation ID for event tracking and logging.

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

A [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) object representing the error.

## Remarks

Attempts to extract response time from Axios errors if available. For non-Error objects, uses "Unknown error" as a fallback message. Logs all errors for diagnostic purposes. Always returns a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) and never throws.

## Example

```typescript
handleCheckError(new Error("Unexpected failure"), "https://example.com", "corr-789");
```

## See

[MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
