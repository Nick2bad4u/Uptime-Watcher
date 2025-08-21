# Function: handlePortCheckError()

> **handlePortCheckError**(`error`, `host`, `port`): [`PortCheckErrorResult`](../interfaces/PortCheckErrorResult.md)

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L169)

Normalizes errors from port checks into a standardized result structure for
frontend consumption.

## Parameters

### error

`unknown`

The error thrown during port checking. May be any type, but
  typically an [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) or [PortCheckError](../classes/PortCheckError.md).

### host

`string`

The hostname or IP address being checked.

### port

`number`

The port number being checked.

## Returns

[`PortCheckErrorResult`](../interfaces/PortCheckErrorResult.md)

A [PortCheckErrorResult](../interfaces/PortCheckErrorResult.md) containing error details, standardized
  message, timing, and status.

## Remarks

Converts any error thrown during a port check into a
[PortCheckErrorResult](../interfaces/PortCheckErrorResult.md) object. If the error is a [PortCheckError](../classes/PortCheckError.md),
its response time is preserved; otherwise, responseTime is set to -1. Logs
debug information in development mode for diagnostics.

## Example

```typescript
try {
    // ...port check logic...
} catch (err) {
    const result = handlePortCheckError(err, "example.com", 443);
    // result.status === "down"
}
```

## See

 - [PortCheckError](../classes/PortCheckError.md)
 - [PortCheckErrorResult](../interfaces/PortCheckErrorResult.md)
