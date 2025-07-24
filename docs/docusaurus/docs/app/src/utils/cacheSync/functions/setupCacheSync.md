# Function: setupCacheSync()

> **setupCacheSync**(): () => `void`

Defined in: [src/utils/cacheSync.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/cacheSync.ts#L25)

Set up automatic cache synchronization with backend.
Listens for cache invalidation events and clears appropriate frontend caches.

## Returns

Cleanup function to remove event listeners

> (): `void`

### Returns

`void`
