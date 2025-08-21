# Function: getTypesWithFeature()

> **getTypesWithFeature**(`feature`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]\>

Defined in: [src/utils/monitorUiHelpers.ts:317](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L317)

Get available monitor types that support a specific feature.

## Parameters

### feature

Feature to check for ('responseTime' | 'advancedAnalytics')

`"responseTime"` | `"advancedAnalytics"`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]\>

Array of monitor types that support the feature
