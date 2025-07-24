# Function: handlePortCheckError()

> **handlePortCheckError**(`error`, `host`, `port`): [`PortCheckErrorResult`](../interfaces/PortCheckErrorResult.md)

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/portErrorHandling.ts#L76)

Handle errors that occur during port checks with standardized formatting.

## Parameters

### error

`unknown`

Unknown error that occurred during port checking

### host

`string`

The hostname or IP address being checked

### port

`number`

The port number being checked

## Returns

[`PortCheckErrorResult`](../interfaces/PortCheckErrorResult.md)

Standardized error result for monitor check failures

## Remarks

Processes various error types and normalizes them into a consistent format
for frontend consumption. Extracts timing information from PortCheckError
instances to support retry logic analysis.

Response time defaults to -1 when timing information is unavailable,
distinguishing from valid 0ms responses.
