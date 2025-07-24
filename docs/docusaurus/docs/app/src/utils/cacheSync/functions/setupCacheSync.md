# Function: setupCacheSync()

> **setupCacheSync**(): () => `void`

Defined in: [src/utils/cacheSync.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cacheSync.ts#L25)

Set up automatic cache synchronization with backend.
Listens for cache invalidation events and clears appropriate frontend caches.

## Returns

Cleanup function to remove event listeners

> (): `void`

### Returns

`void`
