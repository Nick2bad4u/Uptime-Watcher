# Class: StandardizedCache\<T\>

Defined in: [electron/utils/cache/StandardizedCache.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L72)

Standardized cache implementation.

Features:
- Consistent API across all managers
- Automatic TTL expiration
- LRU eviction when max size reached
- Event emission for cache operations
- Hit/miss statistics
- Bulk operations

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new StandardizedCache**\<`T`\>(`config`): `StandardizedCache`\<`T`\>

Defined in: [electron/utils/cache/StandardizedCache.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L96)

#### Parameters

##### config

[`CacheConfig`](../interfaces/CacheConfig.md)

#### Returns

`StandardizedCache`\<`T`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L76)

Get current cache size.

##### Returns

`number`

## Methods

### bulkUpdate()

> **bulkUpdate**(`items`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L116)

Bulk update cache with new data.

Note: Emits only a single bulk-updated event for performance.
Individual item cache events are not emitted during bulk operations.

#### Parameters

##### items

`object`[]

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L129)

Clean up expired entries.

#### Returns

`number`

***

### clear()

> **clear**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L159)

Clear all items from cache.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L176)

Delete item from cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### entries()

> **entries**(): `IterableIterator`\<\[`string`, `T`\]\>

Defined in: [electron/utils/cache/StandardizedCache.ts:192](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L192)

Get cache entries iterator.

#### Returns

`IterableIterator`\<\[`string`, `T`\]\>

***

### get()

> **get**(`key`): `undefined` \| `T`

Defined in: [electron/utils/cache/StandardizedCache.ts:220](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L220)

Get item from cache.

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### getAll()

> **getAll**(): `T`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:249](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L249)

Get all cached values.

#### Returns

`T`[]

***

### getStats()

> **getStats**(): [`CacheStats`](../interfaces/CacheStats.md)

Defined in: [electron/utils/cache/StandardizedCache.ts:278](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L278)

Get cache statistics.
Returns a snapshot of the current statistics, not a live reference.

#### Returns

[`CacheStats`](../interfaces/CacheStats.md)

***

### has()

> **has**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:285](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L285)

Check if key exists in cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### invalidate()

> **invalidate**(`key`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:306](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L306)

Invalidate specific key.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### invalidateAll()

> **invalidateAll**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:319](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L319)

Invalidate all keys.

#### Returns

`void`

***

### keys()

> **keys**(): `string`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:332](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L332)

Get all cache keys.
Filters out expired keys automatically.

#### Returns

`string`[]

***

### onInvalidation()

> **onInvalidation**(`callback`): () => `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:365](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L365)

Register invalidation callback for cache events.

#### Parameters

##### callback

(`key?`) => `void`

Function to call when cache items are invalidated.
                  Called with a specific key when a single item is invalidated,
                  or with undefined when all items are invalidated.

#### Returns

Cleanup function to remove the callback

> (): `void`

##### Returns

`void`

***

### set()

> **set**(`key`, `data`, `ttl?`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:383](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L383)

Set item in cache.

#### Parameters

##### key

`string`

The cache key

##### data

`T`

The data to cache

##### ttl?

`number`

Time to live in milliseconds. If 0 or negative, the item will not expire.

#### Returns

`void`
