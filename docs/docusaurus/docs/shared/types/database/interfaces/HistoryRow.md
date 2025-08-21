# Interface: HistoryRow

Defined in: [shared/types/database.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L32)

Represents a row in the `history` table.

## Remarks

Used for storing monitor status change history and related metadata.

## Extends

- [`BaseRow`](BaseRow.md)

## Properties

### id?

> `optional` **id**: `string` \| `number`

Defined in: [shared/types/database.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L23)

Unique identifier for the row.

#### Remarks

May be a number (autoincrement) or string (custom).

#### Inherited from

[`BaseRow`](BaseRow.md).[`id`](BaseRow.md#id)

***

### details?

> `optional` **details**: `string`

Defined in: [shared/types/database.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L36)

Additional details about the history entry.

***

### monitorId?

> `optional` **monitorId**: `string`

Defined in: [shared/types/database.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L40)

The identifier of the monitor associated with this history entry.

***

### responseTime?

> `optional` **responseTime**: `number`

Defined in: [shared/types/database.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L44)

The response time recorded for this entry, in milliseconds.

***

### status?

> `optional` **status**: `string`

Defined in: [shared/types/database.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L48)

The status of the monitor at this point in history ("up" or "down").

***

### timestamp?

> `optional` **timestamp**: `number`

Defined in: [shared/types/database.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L52)

The timestamp (epoch milliseconds) when this entry was recorded.
