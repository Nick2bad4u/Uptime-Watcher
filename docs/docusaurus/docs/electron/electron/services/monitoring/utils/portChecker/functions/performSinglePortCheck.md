# Function: performSinglePortCheck()

> **performSinglePortCheck**(`host`, `port`, `timeout`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/portChecker.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portChecker.ts#L61)

Performs a single TCP port connectivity check to a specified host and port, without retry logic.

## Parameters

### host

`string`

The target hostname or IP address to check (e.g., "localhost", "192.168.1.1").

### port

`number`

The TCP port number to test for connectivity.

### timeout

`number`

The maximum time to wait for a connection, in milliseconds.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

A promise that resolves to a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) containing port details, response time, and status.

## Remarks

Uses the "is-port-reachable" library to test TCP connectivity to the given host and port, measuring response time with high-precision `performance.now()`. Debug logging is enabled in development mode. This function does not mutate state or trigger events; it is intended for use within repository or service layers that handle orchestration and event propagation.

On success, resolves to a [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) with status `"up"` and the measured response time. On failure, throws a [PortCheckError](../../portErrorHandling/classes/PortCheckError.md) containing the error message and response time for use in retry or error handling logic.

## Example

```typescript
try {
  const result = await performSinglePortCheck("example.com", 80, 5000);
  console.log(`Port check result: ${result.status} in ${result.responseTime}ms`);
} catch (error) {
  if (error instanceof PortCheckError) {
    console.log(`Port unreachable after ${error.responseTime}ms`);
  }
}
```

## Throws

PortCheckError Thrown if the port is not reachable within the timeout, with response time included for diagnostics and retry logic.

## See

 - [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md)
 - [PortCheckError](../../portErrorHandling/classes/PortCheckError.md)
