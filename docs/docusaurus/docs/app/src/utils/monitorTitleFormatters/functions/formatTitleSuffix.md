# Function: formatTitleSuffix()

> **formatTitleSuffix**(`monitor`): `string`

Defined in: [src/utils/monitorTitleFormatters.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTitleFormatters.ts#L48)

Format title suffix for a monitor dynamically

## Parameters

### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

Monitor object to generate suffix for

## Returns

`string`

Formatted suffix string, or empty string if no formatter available

## Remarks

Uses the monitor type to find an appropriate formatter and generate
a descriptive suffix for display purposes (e.g., URL for HTTP monitors).
