# Interface: SiteRow

Defined in: [shared/types/database.ts:157](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L157)

Represents a row in the `site` table.

## Remarks

Stores metadata and monitoring state for each site.

## Extends

- [`BaseRow`](BaseRow.md)

## Properties

### id?

> `optional` **id**: `string` \| `number`

Defined in: [shared/types/database.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L21)

Unique identifier for the row.

#### Remarks

May be a number (autoincrement) or string (custom).

#### Inherited from

[`BaseRow`](BaseRow.md).[`id`](BaseRow.md#id)

***

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/database.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L161)

Unique identifier for the site.

***

### monitoring?

> `optional` **monitoring**: `number`

Defined in: [shared/types/database.ts:165](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L165)

Whether monitoring is enabled for this site (1) or not (0).

***

### name?

> `optional` **name**: `string`

Defined in: [shared/types/database.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L169)

Human-readable name for the site.
