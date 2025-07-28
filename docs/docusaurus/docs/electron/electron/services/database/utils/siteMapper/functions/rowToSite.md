# Function: rowToSite()

> **rowToSite**(`row`): [`SiteRow`](../interfaces/SiteRow.md)

Defined in: [electron/services/database/utils/siteMapper.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/siteMapper.ts#L94)

Convert a database row to a Site object (without monitors).

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw database row

## Returns

[`SiteRow`](../interfaces/SiteRow.md)

Mapped Site object

## Remarks

Handles type conversion and ensures consistent data transformation
across all site-related database operations. Validates that the identifier
is present and valid before creating the site object.

## Throws

When the database row lacks a valid identifier
