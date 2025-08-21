# Function: formatMonitorTitleSuffix()

> **formatMonitorTitleSuffix**(`monitorType`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:250](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L250)

Format title suffix dynamically based on monitor type configuration.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"` | `"ping"` | `"dns"`

### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

Monitor data

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Formatted title suffix string

## Example

```typescript
const suffix = await formatMonitorTitleSuffix("http", {
    url: "https://example.com",
}); // " (https://example.com)"
const suffix = await formatMonitorTitleSuffix("port", {
    host: "localhost",
    port: 80,
}); // " (localhost:80)"
```
