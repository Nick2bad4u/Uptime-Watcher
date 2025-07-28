# Function: getDefaultMonitorId()

> **getDefaultMonitorId**(`monitorIds`): `string`

Defined in: [src/utils/monitorUiHelpers.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L147)

Get the default monitor ID from a list of monitor IDs.

## Parameters

### monitorIds

`string`[]

Array of monitor IDs

## Returns

`string`

Default monitor ID (first valid ID in array) or empty string if array is empty or contains no valid IDs

## Remarks

This function returns the first element of the array if it exists, otherwise an empty string.
It does not validate whether the IDs are actually valid monitor identifiers - that should
be done by the caller if needed. Empty arrays return an empty string as a safe fallback.
