# Interface: SiteRow

Defined in: [electron/services/database/utils/siteMapper.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L26)

Site type for basic operations (without monitors).

## Remarks

Represents a simplified site object used for database operations and mapping.
This interface excludes the monitors array to avoid circular dependencies and
focuses on core site properties.

## Properties

### identifier

> **identifier**: `string`

Defined in: [electron/services/database/utils/siteMapper.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L31)

Unique identifier for the site (required). Must be a non-empty string
that serves as the primary key.

***

### monitoring?

> `optional` **monitoring**: `boolean`

Defined in: [electron/services/database/utils/siteMapper.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L37)

Optional monitoring state for the site. When true, indicates the site is
actively being monitored.

***

### name?

> `optional` **name**: `string`

Defined in: [electron/services/database/utils/siteMapper.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L43)

Optional human-readable name for the site. Used for display purposes in
the UI.
