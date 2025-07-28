# Function: getMonitorTypeConfig()

> **getMonitorTypeConfig**(`type`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`MonitorTypeConfig`](../interfaces/MonitorTypeConfig.md)\>

Defined in: [src/utils/monitorTypeHelper.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L108)

Get configuration for a specific monitor type.

## Parameters

### type

`string`

The monitor type identifier to look up

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`MonitorTypeConfig`](../interfaces/MonitorTypeConfig.md)\>

Promise resolving to monitor type configuration, or undefined if type is not found

## Remarks

Searches through all available monitor types to find a match for the specified type.
Returns undefined if the monitor type is not registered or available from the backend.
The search uses the complete cached list from getAvailableMonitorTypes().
