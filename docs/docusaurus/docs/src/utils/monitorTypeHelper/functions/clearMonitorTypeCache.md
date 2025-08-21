# Function: clearMonitorTypeCache()

> **clearMonitorTypeCache**(): `void`

Defined in: [src/utils/monitorTypeHelper.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorTypeHelper.ts#L30)

Clear the monitor type cache.

## Returns

`void`

## Remarks

Useful for forcing a refresh of monitor type data when types have been
updated or when testing requires fresh data. This clears all cached monitor
type configurations, forcing the next request to fetch from backend.
