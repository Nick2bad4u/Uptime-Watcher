# Interface: SettingsRow

Defined in: [shared/types/database.ts:140](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L140)

Represents a row in the `settings` table.

## Remarks

Used for storing application-wide key-value settings.

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

### key?

> `optional` **key**: `string`

Defined in: [shared/types/database.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L144)

The unique key for the setting.

***

### value?

> `optional` **value**: `string`

Defined in: [shared/types/database.ts:148](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L148)

The value associated with the key.
