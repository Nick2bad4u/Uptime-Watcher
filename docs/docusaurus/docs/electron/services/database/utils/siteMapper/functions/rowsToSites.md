# Function: rowsToSites()

> **rowsToSites**(`rows`): [`SiteRow`](../interfaces/SiteRow.md)[]

Defined in: [electron/services/database/utils/siteMapper.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L139)

Convert multiple database rows to Site objects.

## Parameters

### rows

[`SiteRow`](../../../../../../shared/types/database/interfaces/SiteRow.md)[]

Array of raw database rows

## Returns

[`SiteRow`](../interfaces/SiteRow.md)[]

Array of mapped Site objects

## Remarks

Processes multiple database rows using the [rowToSite](rowToSite.md) function. Each
row is validated and converted independently. If any row fails validation,
the entire operation will fail.

## Throws

When any database row lacks a valid identifier
