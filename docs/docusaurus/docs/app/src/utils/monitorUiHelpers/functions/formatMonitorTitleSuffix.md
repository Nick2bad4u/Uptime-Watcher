# Function: formatMonitorTitleSuffix()

> **formatMonitorTitleSuffix**(`monitorType`, `monitor`): `Promise`\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/monitorUiHelpers.ts#L92)

Format title suffix dynamically based on monitor type configuration.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"`

### monitor

`Record`\<`string`, `unknown`\>

Monitor data

## Returns

`Promise`\<`string`\>

Formatted title suffix string

## Example

```typescript
const suffix = await formatMonitorTitleSuffix("http", { url: "https://example.com" }); // " (https://example.com)"
const suffix = await formatMonitorTitleSuffix("port", { host: "localhost", port: 80 }); // " (localhost:80)"
```
