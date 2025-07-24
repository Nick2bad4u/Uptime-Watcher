# Function: setupCacheSync()

> **setupCacheSync**(): () => `void`

Defined in: [src/utils/cacheSync.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/cacheSync.ts#L25)

Set up automatic cache synchronization with backend.
Listens for cache invalidation events and clears appropriate frontend caches.

## Returns

Cleanup function to remove event listeners

> (): `void`

### Returns

`void`
