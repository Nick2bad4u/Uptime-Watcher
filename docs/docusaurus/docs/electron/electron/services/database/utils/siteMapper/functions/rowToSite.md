# Function: rowToSite()

> **rowToSite**(`row`): [`SiteRow`](../interfaces/SiteRow.md)

Defined in: [electron/services/database/utils/siteMapper.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/siteMapper.ts#L94)

Convert a database row to a Site object (without monitors).

## Parameters

### row

`Record`\<`string`, `unknown`\>

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
