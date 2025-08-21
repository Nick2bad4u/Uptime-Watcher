# Function: getMonitorTypeConfig()

> **getMonitorTypeConfig**(`type`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`MonitorTypeConfig`](../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)\>

Defined in: [src/utils/monitorTypeHelper.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorTypeHelper.ts#L90)

Get configuration for a specific monitor type.

## Parameters

### type

`string`

The monitor type identifier to look up

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`MonitorTypeConfig`](../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)\>

Promise resolving to monitor type configuration, or undefined if
  type is not found

## Remarks

Searches through all available monitor types to find a match for the
specified type. Returns undefined if the monitor type is not registered or
available from the backend. The search uses the complete cached list from
getAvailableMonitorTypes().
