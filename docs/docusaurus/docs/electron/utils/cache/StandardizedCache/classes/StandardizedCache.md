# Class: StandardizedCache\<T\>

Defined in: [electron/utils/cache/StandardizedCache.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L80)

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

Defined in: [electron/utils/cache/StandardizedCache.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L107)

#### Parameters

##### config

[`CacheConfig`](../interfaces/CacheConfig.md)

#### Returns

`StandardizedCache`\<`T`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L103)

Get current cache size.

##### Returns

`number`

## Methods

### bulkUpdate()

> **bulkUpdate**(`items`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L127)

Bulk update cache with new data.

Note: Emits only a single bulk-updated event for performance. Individual
item cache events are not emitted during bulk operations.

#### Parameters

##### items

`object`[]

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L146)

Clean up expired entries.

#### Returns

`number`

***

### clear()

> **clear**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:180](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L180)

Clear all items from cache.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:199](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L199)

Delete item from cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### entries()

> **entries**(): `IterableIterator`\<\[`string`, `T`\]\>

Defined in: [electron/utils/cache/StandardizedCache.ts:215](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L215)

Get cache entries iterator.

#### Returns

`IterableIterator`\<\[`string`, `T`\]\>

***

### get()

> **get**(`key`): `undefined` \| `T`

Defined in: [electron/utils/cache/StandardizedCache.ts:245](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L245)

Get item from cache.

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### getAll()

> **getAll**(): `T`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:274](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L274)

Get all cached values.

#### Returns

`T`[]

***

### getStats()

> **getStats**(): [`CacheStats`](../interfaces/CacheStats.md)

Defined in: [electron/utils/cache/StandardizedCache.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L302)

Get cache statistics. Returns a snapshot of the current statistics, not a
live reference.

#### Returns

[`CacheStats`](../interfaces/CacheStats.md)

***

### has()

> **has**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:309](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L309)

Check if key exists in cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### invalidate()

> **invalidate**(`key`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:330](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L330)

Invalidate specific key.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### invalidateAll()

> **invalidateAll**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:343](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L343)

Invalidate all keys.

#### Returns

`void`

***

### keys()

> **keys**(): `string`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:357](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L357)

Get all cache keys. Filters out expired keys automatically.

#### Returns

`string`[]

***

### onInvalidation()

> **onInvalidation**(`callback`): () => `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:390](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L390)

Register invalidation callback for cache events.

#### Parameters

##### callback

(`key?`) => `void`

Function to call when cache items are invalidated.
  Called with a specific key when a single item is invalidated, or with
  undefined when all items are invalidated.

#### Returns

Cleanup function to remove the callback

> (): `void`

##### Returns

`void`

***

### set()

> **set**(`key`, `data`, `ttl?`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:413](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L413)

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

Time to live in milliseconds. If 0 or negative, the item
  will not expire.

#### Returns

`void`
