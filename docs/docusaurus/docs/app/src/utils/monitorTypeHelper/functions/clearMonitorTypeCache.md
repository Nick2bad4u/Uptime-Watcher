# Function: clearMonitorTypeCache()

> **clearMonitorTypeCache**(): `void`

Defined in: [src/utils/monitorTypeHelper.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L59)

Clear the monitor type cache.

## Returns

`void`

## Remarks

Useful for forcing a refresh of monitor type data when types have been
updated or when testing requires fresh data. This clears all cached
monitor type configurations, forcing the next request to fetch from backend.
