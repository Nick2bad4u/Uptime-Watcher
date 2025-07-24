# Function: getTypesWithFeature()

> **getTypesWithFeature**(`feature`): `Promise`\<(`"http"` \| `"port"`)[]\>

Defined in: [src/utils/monitorUiHelpers.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/monitorUiHelpers.ts#L160)

Get available monitor types that support a specific feature.

## Parameters

### feature

Feature to check for ('responseTime' | 'advancedAnalytics')

`"responseTime"` | `"advancedAnalytics"`

## Returns

`Promise`\<(`"http"` \| `"port"`)[]\>

Array of monitor types that support the feature
