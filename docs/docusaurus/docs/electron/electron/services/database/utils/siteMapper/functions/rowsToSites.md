# Function: rowsToSites()

> **rowsToSites**(`rows`): [`SiteRow`](../interfaces/SiteRow.md)[]

Defined in: [electron/services/database/utils/siteMapper.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/siteMapper.ts#L75)

Convert multiple database rows to Site objects.

## Parameters

### rows

`Record`\<`string`, `unknown`\>[]

Array of raw database rows

## Returns

[`SiteRow`](../interfaces/SiteRow.md)[]

Array of mapped Site objects

## Remarks

Processes multiple database rows using the [rowToSite](rowToSite.md) function.
Each row is validated and converted independently. If any row fails
validation, the entire operation will fail.

## Throws

When any database row lacks a valid identifier
