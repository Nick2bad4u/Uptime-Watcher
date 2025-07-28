# Function: getCachedOrFetch()

> **getCachedOrFetch**\<`T`\>(`cache`, `key`, `fetcher`, `ttl?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/utils/cache.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L226)

Helper for async cache operations with fallback.
Attempts to retrieve value from cache first, falling back to fetcher function if not found.

## Type Parameters

### T

`T`

## Parameters

### cache

[`TypedCache`](../classes/TypedCache.md)\<`string`, `T`\>

The cache instance to use

### key

`string`

The cache key to lookup

### fetcher

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Function to call if cache miss occurs

### ttl?

`number`

Optional TTL override for this operation

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to cached or fetched value
