# Function: formatMonitorTitleSuffix()

> **formatMonitorTitleSuffix**(`monitorType`, `monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorUiHelpers.ts#L92)

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
