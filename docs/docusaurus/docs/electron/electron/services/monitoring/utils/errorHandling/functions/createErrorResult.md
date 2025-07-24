# Function: createErrorResult()

> **createErrorResult**(`error`, `responseTime`, `correlationId?`): [`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Defined in: [electron/services/monitoring/utils/errorHandling.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/errorHandling.ts#L25)

Create a standardized error result for monitor checks.

## Parameters

### error

`string`

Error message describing what went wrong

### responseTime

`number`

Response time in milliseconds at point of failure

### correlationId?

`string`

Optional correlation ID for event tracking

## Returns

[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)

Standardized monitor check result indicating failure

## Remarks

The details field is set to "Error" as a placeholder to indicate
an error state rather than a specific HTTP status code.
This distinguishes error results from successful HTTP responses.
