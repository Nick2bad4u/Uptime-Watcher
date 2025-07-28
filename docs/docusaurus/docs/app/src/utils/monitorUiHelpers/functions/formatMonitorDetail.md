# Function: formatMonitorDetail()

> **formatMonitorDetail**(`monitorType`, `details`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L69)

Format detail label dynamically based on monitor type configuration.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"`

### details

`string`

Detail value to format

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Formatted detail string

## Example

```typescript
const label = await formatMonitorDetail("http", "200"); // "Response Code: 200"
const label = await formatMonitorDetail("port", "80");  // "Port: 80"
```
