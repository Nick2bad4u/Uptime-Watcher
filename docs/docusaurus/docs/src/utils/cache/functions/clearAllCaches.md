# Function: clearAllCaches()

> **clearAllCaches**(): `void`

Defined in: [src/utils/cache.ts:343](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L343)

Clear all entries from the predefined application caches.

## Returns

`void`

## Remarks

This removes all data from the [AppCaches](../variables/AppCaches.md) instances. Use sparingly as
it may cause increased computation or I/O until caches refill.
