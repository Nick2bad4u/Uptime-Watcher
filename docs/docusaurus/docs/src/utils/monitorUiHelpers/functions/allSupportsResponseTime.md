# Function: allSupportsResponseTime()

> **allSupportsResponseTime**(`monitorTypes`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L184)

Check if all monitor types in array support response time. Useful for
conditional rendering of response time charts.

## Parameters

### monitorTypes

(`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]

Array of monitor types to check

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether all types support response time
