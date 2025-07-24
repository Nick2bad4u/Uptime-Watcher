# Function: performPortCheckWithRetry()

> **performPortCheckWithRetry**(`host`, `port`, `timeout`, `maxRetries`): `Promise`\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/portRetry.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portRetry.ts#L62)

Perform port check with sophisticated retry logic and exponential backoff.

## Parameters

### host

`string`

Target hostname or IP address to check

### port

`number`

Port number to test connectivity

### timeout

`number`

Maximum time to wait for each connection attempt in milliseconds

### maxRetries

`number`

Number of additional retry attempts after initial failure (0 = try once only)

## Returns

`Promise`\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to monitor check result with timing and status information

## Remarks

Uses [withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md) for sophisticated retry logic with exponential backoff.
The maxRetries parameter represents additional attempts after the initial attempt,
so maxRetries=3 results in 4 total attempts (1 initial + 3 retries).

Retry logic includes:
- Exponential backoff between attempts
- Debug logging in development mode
- Timing preservation across retry attempts
- Standardized error handling via [handlePortCheckError](../../portErrorHandling/functions/handlePortCheckError.md)

## Example

```typescript
// Try once, no retries
const result = await performPortCheckWithRetry("example.com", 80, 5000, 0);

// Try 4 times total (1 initial + 3 retries)
const result = await performPortCheckWithRetry("example.com", 443, 3000, 3);
```

## See

 - [withOperationalHooks](../../../../../utils/operationalHooks/functions/withOperationalHooks.md) for retry mechanism details
 - [performSinglePortCheck](../../portChecker/functions/performSinglePortCheck.md) for single attempt logic
 - [handlePortCheckError](../../portErrorHandling/functions/handlePortCheckError.md) for error result formatting
