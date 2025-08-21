# Function: getTitleSuffixFormatter()

> **getTitleSuffixFormatter**(`monitorType`): `undefined` \| [`TitleSuffixFormatter`](../type-aliases/TitleSuffixFormatter.md)

Defined in: [src/utils/monitorTitleFormatters.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorTitleFormatters.ts#L55)

Get title suffix formatter for a monitor type

## Parameters

### monitorType

`string`

Type of monitor to get formatter for

## Returns

`undefined` \| [`TitleSuffixFormatter`](../type-aliases/TitleSuffixFormatter.md)

Formatter function if available, undefined otherwise

## Remarks

Used internally by formatTitleSuffix to retrieve the appropriate formatter
function for a given monitor type.
