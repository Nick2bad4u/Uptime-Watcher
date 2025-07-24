# Class: PortCheckError

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/portErrorHandling.ts#L43)

Custom error class that preserves response time information from failed port checks.

## Remarks

Extends the standard Error class to include timing data that can be used
by retry mechanisms to make informed decisions about backoff strategies.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new PortCheckError**(`message`, `responseTime`): `PortCheckError`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/portErrorHandling.ts#L53)

Create a new PortCheckError with timing information.

#### Parameters

##### message

`string`

Error message describing the failure

##### responseTime

`number`

Time taken until failure in milliseconds

#### Returns

`PortCheckError`

#### Overrides

`Error.constructor`

## Properties

### responseTime

> `readonly` **responseTime**: `number`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/portErrorHandling.ts#L45)

Response time at point of failure in milliseconds
