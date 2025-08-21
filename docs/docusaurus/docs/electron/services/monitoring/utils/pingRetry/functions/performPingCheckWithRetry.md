# Function: performPingCheckWithRetry()

> **performPingCheckWithRetry**(`host`, `timeout`, `maxRetries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/pingRetry.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingRetry.ts#L171)

Performs a ping connectivity check with retry logic and exponential backoff.

## Parameters

### host

`string`

Target hostname or IP address to ping

### timeout

`number`

Maximum time to wait for each ping attempt in milliseconds

### maxRetries

`number`

Number of additional retry attempts after initial failure
  (0 = try once only)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) with ping status,
  timing, and details

## Remarks

This function wraps [performSinglePingCheck](performSinglePingCheck.md) with retry logic using
[withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md). It attempts to ping the specified host, retrying
on failure up to `maxRetries` times (for a total of `maxRetries` + `1`
attempts). Exponential backoff is applied between attempts.

Process flow:

1. Validates input parameters
2. Performs initial ping attempt
3. On failure, retries with exponential backoff
4. Returns standardized result or error

Debug logging is enabled in development mode to aid troubleshooting. If all
attempts fail, returns a standardized error result via
[handlePingCheckError](../../pingErrorHandling/functions/handlePingCheckError.md).

## Example

```typescript
// Try once, no retries
const result = await performPingCheckWithRetry("example.com", 5000, 0);

// Try 4 times total (1 initial + 3 retries) with 3-second timeout
const result = await performPingCheckWithRetry("google.com", 3000, 3);
if (result.status === "up") {
    console.log(`Ping successful: ${result.responseTime}ms`);
} else {
    console.log(`Ping failed: ${result.error}`);
}
```

## See

 - [withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md) - Retry logic implementation
 - [performSinglePingCheck](performSinglePingCheck.md) - Single ping attempt function
 - [handlePingCheckError](../../pingErrorHandling/functions/handlePingCheckError.md) - Error handling utility
