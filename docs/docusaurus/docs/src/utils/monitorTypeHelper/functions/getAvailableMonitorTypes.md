# Function: getAvailableMonitorTypes()

> **getAvailableMonitorTypes**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorTypeConfig`](../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)[]\>

Defined in: [src/utils/monitorTypeHelper.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorTypeHelper.ts#L45)

Get all available monitor types from backend via IPC.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorTypeConfig`](../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)[]\>

Promise resolving to array of monitor type configurations

## Remarks

Results are cached for performance using the AppCaches.monitorTypes cache.
The cache key "all-monitor-types" is used to store the complete list. Cache
can be cleared using clearMonitorTypeCache() to force refresh. Falls back to
empty array on error to prevent UI breakage.
