# Function: rowToSite()

> **rowToSite**(`row`): [`SiteRow`](../interfaces/SiteRow.md)

Defined in: [electron/services/database/utils/siteMapper.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L84)

Convert a database row to a Site object (without monitors).

## Parameters

### row

[`SiteRow`](../../../../../../shared/types/database/interfaces/SiteRow.md)

Raw database row to convert

## Returns

[`SiteRow`](../interfaces/SiteRow.md)

Site object with validated fields

## Remarks

Handles type conversion and ensures consistent data transformation across all
site-related database operations. Validates that the identifier is present
and valid before creating the site object.

## Throws

When the database row lacks a valid identifier
