# Interface: SiteRow

Defined in: [shared/types/database.ts:163](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L163)

Represents a row in the `site` table.

## Remarks

Stores metadata and monitoring state for each site.

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

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/database.ts:167](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L167)

Unique identifier for the site.

***

### monitoring?

> `optional` **monitoring**: `number`

Defined in: [shared/types/database.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L171)

Whether monitoring is enabled for this site (1) or not (0).

***

### name?

> `optional` **name**: `string`

Defined in: [shared/types/database.ts:175](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L175)

Human-readable name for the site.
