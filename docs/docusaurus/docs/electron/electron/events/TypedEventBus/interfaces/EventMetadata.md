# Interface: EventMetadata

Defined in: [electron/events/TypedEventBus.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L63)

Metadata automatically added to all emitted events.

## Remarks

Provides debugging and tracking information for each event emission.
This metadata is available in all event listeners under the `_meta` property.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L65)

Identifier of the event bus that emitted this event.

***

### correlationId

> **correlationId**: `string`

Defined in: [electron/events/TypedEventBus.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L67)

Unique identifier for tracking this specific event emission.

***

### eventName

> **eventName**: `string`

Defined in: [electron/events/TypedEventBus.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L69)

Name of the event that was emitted.

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/events/TypedEventBus.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/TypedEventBus.ts#L71)

Unix timestamp when the event was emitted.
