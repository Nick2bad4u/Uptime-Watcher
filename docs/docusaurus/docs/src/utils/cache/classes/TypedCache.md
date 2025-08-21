# Class: TypedCache\<K, V\>

Defined in: [src/utils/cache.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L129)

Generic in-memory cache with optional TTL and LRU eviction.

## Remarks

The implementation uses a [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) to store entries and maintains
`lastAccessed` timestamps for LRU eviction. When `maxSize` is reached a
single entry is evicted (the one with the oldest `lastAccessed`). This
selection is O(n) over the number of entries.

## Type Parameters

### K

`K`

Type of cache keys.

### V

`V`

Type of cached values.

## Constructors

### Constructor

> **new TypedCache**\<`K`, `V`\>(`options`): `TypedCache`\<`K`, `V`\>

Defined in: [src/utils/cache.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L143)

Create a new cache instance.

#### Parameters

##### options

[`CacheOptions`](../interfaces/CacheOptions.md) = `{}`

Optional cache configuration.

#### Returns

`TypedCache`\<`K`, `V`\>

#### Default Value

An instance will use `maxSize` 100 and no default TTL when omitted.

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/utils/cache.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L153)

Current number of entries in the cache.

##### Returns

`number`

Number of stored entries.

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [src/utils/cache.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L168)

Remove entries that have exceeded their TTL from this cache instance.

#### Returns

`void`

#### Remarks

Iterates the underlying [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) and deletes expired items. This is a
best-effort maintenance operation and safe to call periodically (for
example from a scheduled timer). It does not return which keys were
removed.

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/cache.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L184)

Remove all entries from the cache.

#### Returns

`void`

#### Remarks

Clears the internal [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) and resets the cache to empty.

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [src/utils/cache.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L195)

Delete a specific key from the cache.

#### Parameters

##### key

`K`

The cache key to remove.

#### Returns

`boolean`

True if the key existed and was removed; false otherwise.

***

### get()

> **get**(`key`): `undefined` \| `V`

Defined in: [src/utils/cache.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L207)

Retrieve a value if present and not expired.

#### Parameters

##### key

`K`

The cache key to look up.

#### Returns

`undefined` \| `V`

The cached value, or `undefined` when the key does not exist or
  the entry has expired.

***

### has()

> **has**(`key`): `boolean`

Defined in: [src/utils/cache.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L235)

Check whether a non-expired entry exists for the given key.

#### Parameters

##### key

`K`

The cache key to test.

#### Returns

`boolean`

`true` when a valid (non-expired) value exists; `false`
  otherwise.

***

### set()

> **set**(`key`, `value`, `ttl?`): `void`

Defined in: [src/utils/cache.ts:253](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L253)

Insert or update an entry in the cache and optionally specify a per-entry
TTL that overrides the cache's default TTL.

#### Parameters

##### key

`K`

The cache key to set.

##### value

`V`

The value to store under the provided key.

##### ttl?

`number`

Optional per-entry TTL in milliseconds; when omitted the
  cache's `defaultTtl` (if any) will apply.

#### Returns

`void`

#### Remarks

If the cache size would exceed [CacheOptions.maxSize](../interfaces/CacheOptions.md#maxsize) a single
least-recently-used entry is evicted. LRU selection scans all entries and
has O(n) cost.
