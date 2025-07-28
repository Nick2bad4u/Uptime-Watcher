# Function: allSupportsResponseTime()

> **allSupportsResponseTime**(`monitorTypes`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L38)

Check if all monitor types in array support response time.
Useful for conditional rendering of response time charts.

## Parameters

### monitorTypes

(`"http"` \| `"port"`)[]

Array of monitor types to check

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether all types support response time
