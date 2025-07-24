# Interface: SiteRow

Defined in: [electron/services/database/utils/siteMapper.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/siteMapper.ts#L19)

Site type for basic operations (without monitors).

## Remarks

Represents a simplified site object used for database operations and mapping.
This interface excludes the monitors array to avoid circular dependencies
and focuses on core site properties.

## Properties

### identifier

> **identifier**: `string`

Defined in: [electron/services/database/utils/siteMapper.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/siteMapper.ts#L24)

Unique identifier for the site (required).
Must be a non-empty string that serves as the primary key.

***

### monitoring?

> `optional` **monitoring**: `boolean`

Defined in: [electron/services/database/utils/siteMapper.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/siteMapper.ts#L30)

Optional monitoring state for the site.
When true, indicates the site is actively being monitored.

***

### name?

> `optional` **name**: `string`

Defined in: [electron/services/database/utils/siteMapper.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/siteMapper.ts#L36)

Optional human-readable name for the site.
Used for display purposes in the UI.
