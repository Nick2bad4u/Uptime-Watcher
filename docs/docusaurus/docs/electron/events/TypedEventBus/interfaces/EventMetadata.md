# Interface: EventMetadata

Defined in: [electron/events/TypedEventBus.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L83)

Metadata automatically added to all emitted events.

## Remarks

Provides debugging and tracking information for each event emission. This
metadata is available in all event listeners under the `_meta` property.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L85)

Identifier of the event bus that emitted this event.

***

### correlationId

> **correlationId**: `string`

Defined in: [electron/events/TypedEventBus.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L87)

Unique identifier for tracking this specific event emission.

***

### eventName

> **eventName**: `string`

Defined in: [electron/events/TypedEventBus.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L89)

Name of the event that was emitted.

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/events/TypedEventBus.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/TypedEventBus.ts#L91)

Unix timestamp when the event was emitted.
