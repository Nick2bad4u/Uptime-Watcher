# Function: createErrorResult()

> **createErrorResult**(`error`, `responseTime`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/errorHandling.ts#L50)

Constructs a standardized error result for monitor checks.

## Parameters

### error

`string`

The error message describing what went wrong.

### responseTime

`number`

The response time in milliseconds at the point of
  failure.

### correlationId?

`string`

Optional correlation ID for event tracking and
  logging.

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

A [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) object indicating failure.

## Remarks

The `details` field is set to `"Error"` to distinguish error states from
valid HTTP responses. This function is used for both network and generic
errors. The returned object always has `status: "down"`.

## Example

```typescript
createErrorResult("Timeout", 500, "corr-123");
```

## See

[MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
