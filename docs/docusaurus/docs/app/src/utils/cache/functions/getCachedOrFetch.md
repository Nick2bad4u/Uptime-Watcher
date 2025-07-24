# Function: getCachedOrFetch()

> **getCachedOrFetch**\<`T`\>(`cache`, `key`, `fetcher`, `ttl?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/utils/cache.ts:148](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/cache.ts#L148)

Helper for async cache operations with fallback.

## Type Parameters

### T

`T`

## Parameters

### cache

[`TypedCache`](../classes/TypedCache.md)\<`string`, `T`\>

### key

`string`

### fetcher

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

### ttl?

`number`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>
