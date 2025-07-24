# Interface: EventBusDiagnostics

Defined in: [electron/events/TypedEventBus.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L40)

Diagnostic information about an event bus instance.

## Remarks

Provides runtime insights into event bus configuration and usage.
Useful for debugging, monitoring, and performance analysis.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L42)

Unique identifier for this event bus instance

***

### listenerCounts

> **listenerCounts**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number`\>

Defined in: [electron/events/TypedEventBus.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L44)

Number of listeners registered for each event

***

### maxListeners

> **maxListeners**: `number`

Defined in: [electron/events/TypedEventBus.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L46)

Maximum number of listeners allowed per event

***

### maxMiddleware

> **maxMiddleware**: `number`

Defined in: [electron/events/TypedEventBus.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L48)

Maximum number of middleware functions allowed

***

### middlewareCount

> **middlewareCount**: `number`

Defined in: [electron/events/TypedEventBus.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L50)

Number of registered middleware functions

***

### middlewareUtilization

> **middlewareUtilization**: `number`

Defined in: [electron/events/TypedEventBus.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L52)

Percentage of middleware slots used (0-100)
