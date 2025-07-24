# Function: isValidSiteRow()

> **isValidSiteRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/siteMapper.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/siteMapper.ts#L51)

Validate that a row contains the minimum required fields for a site.

## Parameters

### row

`Record`\<`string`, `unknown`\>

Database row to validate

## Returns

`boolean`

True if row is valid

## Remarks

Validates that the row has a valid identifier that is not null, undefined, or empty string.
This ensures database integrity and prevents invalid site creation.
