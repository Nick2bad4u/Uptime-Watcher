# Function: formatMonitorDetail()

> **formatMonitorDetail**(`monitorType`, `details`): `Promise`\<`string`\>

Defined in: [src/utils/monitorUiHelpers.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorUiHelpers.ts#L68)

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
