# Interface: SettingsRow

Defined in: [shared/types/database.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L146)

Represents a row in the `settings` table.

## Remarks

Used for storing application-wide key-value settings.

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

### key?

> `optional` **key**: `string`

Defined in: [shared/types/database.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L150)

The unique key for the setting.

***

### value?

> `optional` **value**: `string`

Defined in: [shared/types/database.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L154)

The value associated with the key.
