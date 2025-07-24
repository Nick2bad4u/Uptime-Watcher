# Class: StandardizedCache\<T\>

Defined in: [electron/utils/cache/StandardizedCache.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L72)

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

Defined in: [electron/utils/cache/StandardizedCache.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L96)

#### Parameters

##### config

[`CacheConfig`](../interfaces/CacheConfig.md)

#### Returns

`StandardizedCache`\<`T`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L76)

Get current cache size.

##### Returns

`number`

## Methods

### bulkUpdate()

> **bulkUpdate**(`items`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L113)

Bulk update cache with new data.

#### Parameters

##### items

`object`[]

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L126)

Clean up expired entries.

#### Returns

`number`

***

### clear()

> **clear**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:156](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L156)

Clear all items from cache.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:173](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L173)

Delete item from cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### entries()

> **entries**(): `IterableIterator`\<\[`string`, `T`\]\>

Defined in: [electron/utils/cache/StandardizedCache.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L189)

Get cache entries iterator.

#### Returns

`IterableIterator`\<\[`string`, `T`\]\>

***

### get()

> **get**(`key`): `undefined` \| `T`

Defined in: [electron/utils/cache/StandardizedCache.ts:217](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L217)

Get item from cache.

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### getAll()

> **getAll**(): `T`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:245](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L245)

Get all cached values.

#### Returns

`T`[]

***

### getStats()

> **getStats**(): [`CacheStats`](../interfaces/CacheStats.md)

Defined in: [electron/utils/cache/StandardizedCache.ts:273](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L273)

Get cache statistics.

#### Returns

[`CacheStats`](../interfaces/CacheStats.md)

***

### has()

> **has**(`key`): `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:280](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L280)

Check if key exists in cache.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### invalidate()

> **invalidate**(`key`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:301](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L301)

Invalidate specific key.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### invalidateAll()

> **invalidateAll**(): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:314](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L314)

Invalidate all keys.

#### Returns

`void`

***

### keys()

> **keys**(): `string`[]

Defined in: [electron/utils/cache/StandardizedCache.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L326)

Get all cache keys.

#### Returns

`string`[]

***

### onInvalidation()

> **onInvalidation**(`callback`): () => `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:336](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L336)

Register invalidation callback for cache events.

#### Parameters

##### callback

(`key?`) => `void`

Function to call when cache items are invalidated

#### Returns

Cleanup function to remove the callback

> (): `void`

##### Returns

`void`

***

### set()

> **set**(`key`, `data`, `ttl?`): `void`

Defined in: [electron/utils/cache/StandardizedCache.ts:350](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/cache/StandardizedCache.ts#L350)

Set item in cache.

#### Parameters

##### key

`string`

##### data

`T`

##### ttl?

`number`

#### Returns

`void`
