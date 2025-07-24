# Function: getTypesWithFeature()

> **getTypesWithFeature**(`feature`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"`)[]\>

Defined in: [src/utils/monitorUiHelpers.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorUiHelpers.ts#L160)

Get available monitor types that support a specific feature.

## Parameters

### feature

Feature to check for ('responseTime' | 'advancedAnalytics')

`"responseTime"` | `"advancedAnalytics"`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<(`"http"` \| `"port"`)[]\>

Array of monitor types that support the feature
