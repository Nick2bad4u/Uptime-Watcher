# Function: isValidSiteRow()

> **isValidSiteRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/siteMapper.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/siteMapper.ts#L60)

Validate that a row contains the minimum required fields for a site.

## Parameters

### row

[`SiteRow`](../../../../../../shared/types/database/interfaces/SiteRow.md)

Database row to validate

## Returns

`boolean`

True if row is valid

## Remarks

Validates that the row has a valid identifier that is not null, undefined, or
empty string. This ensures database integrity and prevents invalid site
creation.
