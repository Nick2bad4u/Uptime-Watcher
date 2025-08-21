# Interface: CacheOptions

Defined in: [src/utils/cache.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L99)

Configuration options for creating a [TypedCache](../classes/TypedCache.md) instance.

## Remarks

Both properties are optional. When omitted, the cache uses a sensible default
for `maxSize` and no default TTL (entries will not expire unless a TTL is
provided at `set` time).

## Properties

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [src/utils/cache.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L106)

Maximum number of entries the cache will retain before evicting the
least-recently-used entries.

#### Default Value

```ts
100
```

***

### ttl?

> `optional` **ttl**: `number`

Defined in: [src/utils/cache.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L112)

Default time-to-live in milliseconds applied to entries when no per-entry
TTL is provided.
