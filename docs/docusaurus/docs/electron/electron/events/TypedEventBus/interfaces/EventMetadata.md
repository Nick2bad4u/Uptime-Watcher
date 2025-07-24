# Interface: EventMetadata

Defined in: [electron/events/TypedEventBus.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/TypedEventBus.ts#L64)

Metadata automatically added to all emitted events.

## Remarks

Provides debugging and tracking information automatically added to every event.
Available in all event listeners under the `_meta` property.

## Properties

### busId

> **busId**: `string`

Defined in: [electron/events/TypedEventBus.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/TypedEventBus.ts#L66)

Identifier of the event bus that emitted this event

***

### correlationId

> **correlationId**: `string`

Defined in: [electron/events/TypedEventBus.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/TypedEventBus.ts#L68)

Unique identifier for tracking this specific event emission

***

### eventName

> **eventName**: `string`

Defined in: [electron/events/TypedEventBus.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/TypedEventBus.ts#L70)

Name of the event that was emitted

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/events/TypedEventBus.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/TypedEventBus.ts#L72)

Unix timestamp when the event was emitted
