# Interface: DatabaseErrorEventData

Defined in: [shared/types/events.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L116)

Payload for database error events.

## Remarks

Used to communicate database operation errors with detailed context. Provides
structured error information for debugging and monitoring.

## Example

```typescript
const event: DatabaseErrorEventData = {
    error: new Error("Connection timeout"),
    operation: "query",
    table: "monitors",
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

### error

> **error**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Defined in: [shared/types/events.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L118)

The actual error that occurred

***

### operation

> **operation**: [`DatabaseOperation`](../type-aliases/DatabaseOperation.md)

Defined in: [shared/types/events.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L120)

The database operation that failed

***

### parameters?

> `optional` **parameters**: `unknown`[]

Defined in: [shared/types/events.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L122)

SQL parameters that were used (optional for debugging)

***

### table?

> `optional` **table**: `string`

Defined in: [shared/types/events.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L124)

The database table involved (optional)
