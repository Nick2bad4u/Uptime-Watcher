# Function: setupCacheSync()

> **setupCacheSync**(): () => `void`

Defined in: [src/utils/cacheSync.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cacheSync.ts#L124)

Set up automatic cache synchronization with backend. Listens for cache
invalidation events and clears appropriate frontend caches.

## Returns

Cleanup function to remove event listeners. Call this function when
  the component unmounts or cache sync is no longer needed to prevent memory
  leaks and avoid processing events after cleanup.

> (): `void`

### Returns

`void`
