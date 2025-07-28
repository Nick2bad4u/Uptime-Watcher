# Class: TypedCache\<K, V\>

Defined in: [src/utils/cache.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L48)

Generic cache implementation with TTL support and LRU eviction.

## Remarks

This cache implementation provides:
- TTL (Time To Live) support for automatic expiration
- LRU (Least Recently Used) eviction when max size is reached
- Type-safe operations with generic key-value types
- Automatic cleanup of expired entries

Generic types:
- K: Type of cache keys
- V: Type of cached values

## Type Parameters

### K

`K`

### V

`V`

## Constructors

### Constructor

> **new TypedCache**\<`K`, `V`\>(`options`): `TypedCache`\<`K`, `V`\>

Defined in: [src/utils/cache.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L67)

Create a new TypedCache instance.

#### Parameters

##### options

[`CacheOptions`](../interfaces/CacheOptions.md) = `{}`

Cache configuration options including maxSize and ttl

#### Returns

`TypedCache`\<`K`, `V`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/utils/cache.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L54)

Get cache size.

##### Returns

`number`

Number of entries currently in the cache

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [src/utils/cache.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L76)

Clean up expired entries.
Removes all entries that have exceeded their TTL.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/cache.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L90)

Clear all cached entries.
Removes all entries from the cache.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [src/utils/cache.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L100)

Delete specific key.

#### Parameters

##### key

`K`

The key to delete from the cache

#### Returns

`boolean`

True if the key existed and was deleted, false otherwise

***

### get()

> **get**(`key`): `undefined` \| `V`

Defined in: [src/utils/cache.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L111)

Get value from cache if not expired.
Updates last accessed time for LRU tracking.

#### Parameters

##### key

`K`

The key to retrieve from the cache

#### Returns

`undefined` \| `V`

The cached value if found and not expired, undefined otherwise

***

### has()

> **has**(`key`): `boolean`

Defined in: [src/utils/cache.ts:136](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L136)

Check if key exists and is not expired.

#### Parameters

##### key

`K`

The key to check for existence

#### Returns

`boolean`

True if the key exists and has not expired, false otherwise

***

### set()

> **set**(`key`, `value`, `ttl?`): `void`

Defined in: [src/utils/cache.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/cache.ts#L149)

Set value in cache with optional TTL.
Uses LRU eviction when max size is reached.

#### Parameters

##### key

`K`

##### value

`V`

##### ttl?

`number`

#### Returns

`void`

#### Remarks

Current implementation uses O(n) iteration to find LRU entry.
For large caches (\>1000 entries), consider using a more efficient
LRU implementation with doubly-linked list for O(1) eviction.
