# Interface: BaseRow

Defined in: [shared/types/database.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L16)

Base interface for all database row types.

## Remarks

Provides a common optional `id` property for tables that use numeric or
string IDs.

## Extended by

- [`HistoryRow`](HistoryRow.md)
- [`MonitorRow`](MonitorRow.md)
- [`SettingsRow`](SettingsRow.md)
- [`SiteRow`](SiteRow.md)

## Properties

### id?

> `optional` **id**: `string` \| `number`

Defined in: [shared/types/database.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L23)

Unique identifier for the row.

#### Remarks

May be a number (autoincrement) or string (custom).
