# Class: PortCheckError

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/portErrorHandling.ts#L43)

Custom error class that preserves response time information from failed port checks.

## Remarks

Extends the standard Error class to include timing data that can be used
by retry mechanisms to make informed decisions about backoff strategies.

## Extends

- `Error`

## Constructors

### Constructor

> **new PortCheckError**(`message`, `responseTime`): `PortCheckError`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/portErrorHandling.ts#L53)

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

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/utils/portErrorHandling.ts#L45)

Response time at point of failure in milliseconds
