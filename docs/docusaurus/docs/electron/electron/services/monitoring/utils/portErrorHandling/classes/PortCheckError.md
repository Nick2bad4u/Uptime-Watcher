# Class: PortCheckError

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L89)

Custom error class for port connectivity failures, preserving response time information.

## Remarks

Extends the standard [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) class to include timing data, supporting diagnostics and retry/backoff strategies.

## Example

```typescript
throw new PortCheckError("Port not reachable", 1200);
```

## Param

The error message describing the failure.

## Param

The time taken until failure in milliseconds.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new PortCheckError**(`message`, `responseTime`): `PortCheckError`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L108)

Constructs a new PortCheckError with timing information.

#### Parameters

##### message

`string`

The error message describing the failure.

##### responseTime

`number`

The time taken until failure in milliseconds.

#### Returns

`PortCheckError`

#### Remarks

Sets the error name to "PortCheckError" and preserves the response time for analysis.

#### Overrides

`Error.constructor`

## Properties

### responseTime

> `readonly` **responseTime**: `number`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L96)

The response time at the point of failure, in milliseconds.
