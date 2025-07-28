# Function: allSupportsAdvancedAnalytics()

> **allSupportsAdvancedAnalytics**(`monitorTypes`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L20)

Check if all monitor types in array support advanced analytics.
Useful for conditional rendering of advanced analytics components.

## Parameters

### monitorTypes

(`"http"` \| `"port"`)[]

Array of monitor types to check

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether all types support advanced analytics
