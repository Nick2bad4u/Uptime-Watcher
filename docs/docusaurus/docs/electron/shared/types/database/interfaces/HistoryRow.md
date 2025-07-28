# Interface: HistoryRow

Defined in: [shared/types/database.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L30)

Represents a row in the `history` table.

## Remarks

Used for storing monitor status change history and related metadata.

## Extends

- [`BaseRow`](BaseRow.md)

## Properties

### details?

> `optional` **details**: `string`

Defined in: [shared/types/database.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L34)

Additional details about the history entry.

***

### id?

> `optional` **id**: `string` \| `number`

Defined in: [shared/types/database.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L21)

Unique identifier for the row.

#### Remarks

May be a number (autoincrement) or string (custom).

#### Inherited from

[`BaseRow`](BaseRow.md).[`id`](BaseRow.md#id)

***

### monitorId?

> `optional` **monitorId**: `string`

Defined in: [shared/types/database.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L38)

The identifier of the monitor associated with this history entry.

***

### responseTime?

> `optional` **responseTime**: `number`

Defined in: [shared/types/database.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L42)

The response time recorded for this entry, in milliseconds.

***

### status?

> `optional` **status**: `string`

Defined in: [shared/types/database.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L46)

The status of the monitor at this point in history ("up" or "down").

***

### timestamp?

> `optional` **timestamp**: `number`

Defined in: [shared/types/database.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L50)

The timestamp (epoch milliseconds) when this entry was recorded.
