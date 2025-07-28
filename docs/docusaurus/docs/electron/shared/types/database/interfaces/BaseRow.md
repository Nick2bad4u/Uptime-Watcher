# Interface: BaseRow

Defined in: [shared/types/database.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L15)

Base interface for all database row types.

## Remarks

Provides a common optional `id` property for tables that use numeric or string IDs.

## Extended by

- [`HistoryRow`](HistoryRow.md)
- [`MonitorRow`](MonitorRow.md)
- [`SettingsRow`](SettingsRow.md)
- [`SiteRow`](SiteRow.md)

## Properties

### id?

> `optional` **id**: `string` \| `number`

Defined in: [shared/types/database.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L21)

Unique identifier for the row.

#### Remarks

May be a number (autoincrement) or string (custom).
