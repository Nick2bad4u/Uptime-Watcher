# Function: allSupportsAdvancedAnalytics()

> **allSupportsAdvancedAnalytics**(`monitorTypes`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorUiHelpers.ts#L19)

Check if all monitor types in array support advanced analytics.
Useful for conditional rendering of advanced analytics components.

## Parameters

### monitorTypes

(`"http"` \| `"port"`)[]

Array of monitor types to check

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Whether all types support advanced analytics
