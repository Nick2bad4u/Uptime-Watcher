# Function: supportsResponseTime()

> **supportsResponseTime**(`monitorType`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:140](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L140)

Check if monitor type supports response time analytics.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"` | `"ping"` | `"dns"`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether monitor supports response time analytics
