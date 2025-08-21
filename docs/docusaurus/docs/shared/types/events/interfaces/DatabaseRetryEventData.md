# Interface: DatabaseRetryEventData

Defined in: [shared/types/events.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L145)

Payload for database retry events.

## Remarks

Used to track retry attempts for failed database operations. Helps with
monitoring and debugging database reliability.

## Example

```typescript
const event: DatabaseRetryEventData = {
    attempt: 2,
    maxAttempts: 3,
    operation: "query",
    delay: 1000,
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

### attempt

> **attempt**: `number`

Defined in: [shared/types/events.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L147)

Current attempt number (1-based)

***

### delay

> **delay**: `number`

Defined in: [shared/types/events.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L149)

Delay before this retry attempt in milliseconds

***

### maxAttempts

> **maxAttempts**: `number`

Defined in: [shared/types/events.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L151)

Maximum number of attempts allowed

***

### operation

> **operation**: [`DatabaseOperation`](../type-aliases/DatabaseOperation.md)

Defined in: [shared/types/events.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L153)

The database operation being retried
