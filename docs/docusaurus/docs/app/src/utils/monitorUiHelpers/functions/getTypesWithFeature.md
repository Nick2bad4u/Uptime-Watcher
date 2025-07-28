# Function: getTypesWithFeature()

> **getTypesWithFeature**(`feature`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"`)[]\>

Defined in: [src/utils/monitorUiHelpers.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorUiHelpers.ts#L177)

Get available monitor types that support a specific feature.

## Parameters

### feature

Feature to check for ('responseTime' | 'advancedAnalytics')

`"responseTime"` | `"advancedAnalytics"`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"`)[]\>

Array of monitor types that support the feature
