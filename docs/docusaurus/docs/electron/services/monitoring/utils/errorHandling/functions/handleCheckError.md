# Function: handleCheckError()

> **handleCheckError**(`error`, `url`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/errorHandling.ts#L151)

Handles unknown errors that occur during health checks, with correlation
tracking.

## Parameters

### error

`unknown`

The unknown error thrown during monitoring (can be any type).

### url

`string`

The URL being monitored when the error occurred.

### correlationId?

`string`

Optional correlation ID for event tracking and
  logging.

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

A [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) object representing the error.

## Remarks

Attempts to extract response time from Axios errors if available. For
non-Error objects, uses "Unknown error" as a fallback message. Logs all
errors for diagnostic purposes. Always returns a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
and never throws.

## Example

```typescript
handleCheckError(
    new Error("Unexpected failure"),
    "https://example.com",
    "corr-789"
);
```

## See

[MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
