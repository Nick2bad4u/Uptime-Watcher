# Function: getTitleSuffixFormatter()

> **getTitleSuffixFormatter**(`monitorType`): `undefined` \| [`TitleSuffixFormatter`](../type-aliases/TitleSuffixFormatter.md)

Defined in: [src/utils/monitorTitleFormatters.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTitleFormatters.ts#L70)

Get title suffix formatter for a monitor type

## Parameters

### monitorType

`string`

Type of monitor to get formatter for

## Returns

`undefined` \| [`TitleSuffixFormatter`](../type-aliases/TitleSuffixFormatter.md)

Formatter function if available, undefined otherwise

## Remarks

Used internally by formatTitleSuffix to retrieve the appropriate
formatter function for a given monitor type.
