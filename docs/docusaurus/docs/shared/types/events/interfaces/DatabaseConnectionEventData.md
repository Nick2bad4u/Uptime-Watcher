# Interface: DatabaseConnectionEventData

Defined in: [shared/types/events.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L90)

Payload for database connection events.

## Remarks

Used to track database connection state changes. Important for monitoring
database availability and connection health.

## Example

```typescript
const event: DatabaseConnectionEventData = {
    state: "connected",
    connectionId: "conn_123",
};
```

## Extends

- [`BaseEventData`](BaseEventData.md)

## Properties

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L24)

The time (in ms since epoch) when the event occurred.

#### Inherited from

[`BaseEventData`](BaseEventData.md).[`timestamp`](BaseEventData.md#timestamp)

***

### connectionId?

> `optional` **connectionId**: `string`

Defined in: [shared/types/events.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L92)

Unique identifier for the connection

***

### details?

> `optional` **details**: `string`

Defined in: [shared/types/events.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L94)

Additional context about the connection state

***

### state

> **state**: `"connected"` \| `"connecting"` \| `"disconnected"` \| `"error"`

Defined in: [shared/types/events.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L96)

Current connection state
