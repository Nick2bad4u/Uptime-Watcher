# Function: allSupportsAdvancedAnalytics()

> **allSupportsAdvancedAnalytics**(`monitorTypes`): `Promise`\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorUiHelpers.ts#L19)

Check if all monitor types in array support advanced analytics.
Useful for conditional rendering of advanced analytics components.

## Parameters

### monitorTypes

(`"http"` \| `"port"`)[]

Array of monitor types to check

## Returns

`Promise`\<`boolean`\>

Whether all types support advanced analytics
