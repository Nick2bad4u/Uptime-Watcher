# Interface: EventBusDiagnostics

Defined in: [electron/events/TypedEventBus.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L39)

Diagnostic information about a [TypedEventBus](../classes/TypedEventBus.md) instance.

## Remarks

Provides runtime insights into event bus configuration and usage, including listener and middleware statistics.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L41)

Unique identifier for this event bus instance.

***

### listenerCounts

> **listenerCounts**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number`\>

Defined in: [electron/events/TypedEventBus.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L43)

Number of listeners registered for each event.

***

### maxListeners

> **maxListeners**: `number`

Defined in: [electron/events/TypedEventBus.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L45)

Maximum number of listeners allowed per event.

***

### maxMiddleware

> **maxMiddleware**: `number`

Defined in: [electron/events/TypedEventBus.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L47)

Maximum number of middleware functions allowed.

***

### middlewareCount

> **middlewareCount**: `number`

Defined in: [electron/events/TypedEventBus.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L49)

Number of registered middleware functions.

***

### middlewareUtilization

> **middlewareUtilization**: `number`

Defined in: [electron/events/TypedEventBus.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L51)

Percentage of middleware slots used (0-100).
