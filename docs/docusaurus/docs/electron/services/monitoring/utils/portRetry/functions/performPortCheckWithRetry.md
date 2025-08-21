# Function: performPortCheckWithRetry()

> **performPortCheckWithRetry**(`host`, `port`, `timeout`, `maxRetries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/portRetry.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portRetry.ts#L78)

Performs a TCP port connectivity check with retry logic and exponential
backoff.

## Parameters

### host

`string`

Target hostname or IP address to check.

### port

`number`

Port number to test connectivity.

### timeout

`number`

Maximum time to wait for each connection attempt in
  milliseconds.

### maxRetries

`number`

Number of additional retry attempts after initial failure
  (0 = try once only).

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

A promise that resolves to a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) containing
  port details, response time, and status. If all attempts fail, the result
  is a standardized error result.

## Remarks

This function wraps [performSinglePortCheck](../../portChecker/functions/performSinglePortCheck.md) with retry logic using
[withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md). It attempts to connect to the specified host and
port, retrying on failure up to `maxRetries` times (for a total of
`maxRetries + 1` attempts). Exponential backoff is applied between attempts.
Debug logging is enabled in development mode. If all attempts fail, a
standardized error result is returned via [handlePortCheckError](../../portErrorHandling/functions/handlePortCheckError.md).

## Example

```typescript
// Try once, no retries
const result = await performPortCheckWithRetry(
    "example.com",
    80,
    5000,
    0
);

// Try 4 times total (1 initial + 3 retries)
const result = await performPortCheckWithRetry(
    "example.com",
    443,
    3000,
    3
);
```

## See

 - [withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md)
 - [performSinglePortCheck](../../portChecker/functions/performSinglePortCheck.md)
 - [handlePortCheckError](../../portErrorHandling/functions/handlePortCheckError.md)
