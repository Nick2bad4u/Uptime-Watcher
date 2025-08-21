# Function: allSupportsAdvancedAnalytics()

> **allSupportsAdvancedAnalytics**(`monitorTypes`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L161)

Check if all monitor types in array support advanced analytics. Useful for
conditional rendering of advanced analytics components.

## Parameters

### monitorTypes

(`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]

Array of monitor types to check

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether all types support advanced analytics
