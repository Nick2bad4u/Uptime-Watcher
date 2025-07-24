# Function: getTypesWithFeature()

> **getTypesWithFeature**(`feature`): `Promise`\<(`"http"` \| `"port"`)[]\>

Defined in: [src/utils/monitorUiHelpers.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorUiHelpers.ts#L160)

Get available monitor types that support a specific feature.

## Parameters

### feature

Feature to check for ('responseTime' | 'advancedAnalytics')

`"responseTime"` | `"advancedAnalytics"`

## Returns

`Promise`\<(`"http"` \| `"port"`)[]\>

Array of monitor types that support the feature
