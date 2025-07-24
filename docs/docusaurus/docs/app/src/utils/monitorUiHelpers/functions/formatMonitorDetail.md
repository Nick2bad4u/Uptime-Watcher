# Function: formatMonitorDetail()

> **formatMonitorDetail**(`monitorType`, `details`): `Promise`\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/monitorUiHelpers.ts#L68)

Format detail label dynamically based on monitor type configuration.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"`

### details

`string`

Detail value to format

## Returns

`Promise`\<`string`\>

Formatted detail string

## Example

```typescript
const label = await formatMonitorDetail("http", "200"); // "Response Code: 200"
const label = await formatMonitorDetail("port", "80");  // "Port: 80"
```
