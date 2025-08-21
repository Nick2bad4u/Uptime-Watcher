# Interface: EventBusDiagnostics

Defined in: [electron/events/TypedEventBus.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L59)

Diagnostic information about a [TypedEventBus](../classes/TypedEventBus.md) instance.

## Remarks

Provides runtime insights into event bus configuration and usage, including
listener and middleware statistics.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L61)

Unique identifier for this event bus instance.

***

### listenerCounts

> **listenerCounts**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number`\>

Defined in: [electron/events/TypedEventBus.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L63)

Number of listeners registered for each event.

***

### maxListeners

> **maxListeners**: `number`

Defined in: [electron/events/TypedEventBus.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L65)

Maximum number of listeners allowed per event.

***

### maxMiddleware

> **maxMiddleware**: `number`

Defined in: [electron/events/TypedEventBus.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L67)

Maximum number of middleware functions allowed.

***

### middlewareCount

> **middlewareCount**: `number`

Defined in: [electron/events/TypedEventBus.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L69)

Number of registered middleware functions.

***

### middlewareUtilization

> **middlewareUtilization**: `number`

Defined in: [electron/events/TypedEventBus.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L71)

Percentage of middleware slots used (0-100).
