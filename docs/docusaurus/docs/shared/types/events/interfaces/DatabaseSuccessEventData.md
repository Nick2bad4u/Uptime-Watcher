# Interface: DatabaseSuccessEventData

Defined in: [shared/types/events.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L174)

Payload for database success events.

## Remarks

Used to track successful database operations for monitoring and performance
analysis. Provides metrics about operation performance and cache
utilization.

## Example

```typescript
const event: DatabaseSuccessEventData = {
    operation: "query",
    duration: 45,
    cacheHit: true,
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

### cacheHit?

> `optional` **cacheHit**: `boolean`

Defined in: [shared/types/events.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L176)

Whether this operation was served from cache

***

### duration?

> `optional` **duration**: `number`

Defined in: [shared/types/events.ts:178](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L178)

Duration of the operation in milliseconds

***

### operation

> **operation**: [`DatabaseOperation`](../type-aliases/DatabaseOperation.md)

Defined in: [shared/types/events.ts:180](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L180)

The database operation that succeeded

***

### rowCount?

> `optional` **rowCount**: `number`

Defined in: [shared/types/events.ts:182](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L182)

Number of rows affected/returned
