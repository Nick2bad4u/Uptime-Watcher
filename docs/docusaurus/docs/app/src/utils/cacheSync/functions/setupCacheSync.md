# Function: setupCacheSync()

> **setupCacheSync**(): () => `void`

Defined in: [src/utils/cacheSync.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cacheSync.ts#L33)

Set up automatic cache synchronization with backend.
Listens for cache invalidation events and clears appropriate frontend caches.

## Returns

Cleanup function to remove event listeners. Call this function
when the component unmounts or cache sync is no longer needed to prevent
memory leaks and avoid processing events after cleanup.

> (): `void`

### Returns

`void`
