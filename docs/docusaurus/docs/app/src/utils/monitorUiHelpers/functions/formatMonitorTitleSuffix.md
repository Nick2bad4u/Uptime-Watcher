# Function: formatMonitorTitleSuffix()

> **formatMonitorTitleSuffix**(`monitorType`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L99)

Format title suffix dynamically based on monitor type configuration.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"`

### monitor

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor data

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Formatted title suffix string

## Example

```typescript
const suffix = await formatMonitorTitleSuffix("http", { url: "https://example.com" }); // " (https://example.com)"
const suffix = await formatMonitorTitleSuffix("port", { host: "localhost", port: 80 }); // " (localhost:80)"
```
