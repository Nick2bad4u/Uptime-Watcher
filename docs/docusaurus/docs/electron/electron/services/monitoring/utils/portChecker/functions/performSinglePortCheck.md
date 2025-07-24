# Function: performSinglePortCheck()

> **performSinglePortCheck**(`host`, `port`, `timeout`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/utils/portChecker.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/portChecker.ts#L53)

Perform a single port check attempt without retry logic.

## Parameters

### host

`string`

Target hostname or IP address to check

### port

`number`

Port number to test connectivity

### timeout

`number`

Maximum time to wait for connection in milliseconds

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to monitor check result with timing information

## Throws

PortCheckError When port is not reachable, includes response time for retry logic

## Remarks

Uses the `is-port-reachable` library to test TCP connectivity to the specified port.
Measures response time using high-precision performance.now() timing.

On successful connection, returns a result with status "up" and actual response time.
On connection failure, throws PortCheckError with timing information to support
retry mechanisms that need response time data.

Debug logging is automatically enabled in development mode for troubleshooting.

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

## See

 - [PortCheckError](../../portErrorHandling/classes/PortCheckError.md) for error details
 - [MonitorCheckResult](../../../types/interfaces/MonitorCheckResult.md) for return type structure
