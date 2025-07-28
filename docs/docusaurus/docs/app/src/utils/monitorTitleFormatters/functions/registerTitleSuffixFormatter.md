# Function: registerTitleSuffixFormatter()

> **registerTitleSuffixFormatter**(`monitorType`, `formatter`): `void`

Defined in: [src/utils/monitorTitleFormatters.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTitleFormatters.ts#L92)

Register a title suffix formatter for a monitor type.

## Parameters

### monitorType

`string`

The monitor type identifier to register formatter for

### formatter

[`TitleSuffixFormatter`](../type-aliases/TitleSuffixFormatter.md)

The formatter function that takes a monitor and returns a suffix string

## Returns

`void`

## Remarks

This function allows dynamic registration of title suffix formatters for different monitor types.
The formatter function will be called with a monitor object and should return a string suffix
to be appended to monitor titles for display purposes. If a formatter already exists for the
monitor type, it will be replaced with the new formatter.

## Example

```typescript
registerTitleSuffixFormatter("custom", (monitor) => ` (${monitor.customField})`);
```
