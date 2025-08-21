# Function: cleanupAllCaches()

> **cleanupAllCaches**(): `void`

Defined in: [src/utils/cache.ts:322](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L322)

Remove expired entries from all predefined application caches.

## Returns

`void`

## Remarks

Iterates the caches in [AppCaches](../variables/AppCaches.md) and calls [TypedCache.cleanup](../classes/TypedCache.md#cleanup)
on each. This is a convenience for scheduled maintenance tasks.
