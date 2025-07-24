# Function: getCachedOrFetch()

> **getCachedOrFetch**\<`T`\>(`cache`, `key`, `fetcher`, `ttl?`): `Promise`\<`T`\>

Defined in: [src/utils/cache.ts:148](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/cache.ts#L148)

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

() => `Promise`\<`T`\>

### ttl?

`number`

## Returns

`Promise`\<`T`\>
