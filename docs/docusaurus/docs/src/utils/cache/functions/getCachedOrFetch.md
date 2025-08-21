# Function: getCachedOrFetch()

> **getCachedOrFetch**\<`T`\>(`cache`, `key`, `fetcher`, `ttl?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/utils/cache.ts:394](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L394)

Retrieve a value from a cache or compute and store it on a cache miss.

## Type Parameters

### T

`T`

Type of the cached value.

## Parameters

### cache

[`TypedCache`](../classes/TypedCache.md)\<`string`, `T`\>

Cache instance to use for lookup and storage.

### key

`string`

Cache key to look up.

### fetcher

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async function that computes or fetches the value on a cache
  miss.

### ttl?

`number`

Optional per-entry TTL in milliseconds to apply when storing the
  fetched value; when omitted the cache's default TTL (if any) applies.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

A promise that resolves to the cached or freshly fetched value.

## Remarks

The function first attempts to read from the supplied [TypedCache](../classes/TypedCache.md). If
the key is absent or expired it invokes `fetcher` to obtain the value, stores
the result in the cache (honoring an optional `ttl`), and returns the value.
Any exception thrown by `fetcher` is propagated to the caller and no value is
cached in that case.

## Example

```ts
const value = await getCachedOrFetch(
    AppCaches.general,
    "user:123",
    async () => {
        const resp = await apiClient.get("/user/123");
        return resp.data;
    },
    60_000
);
```

## Throws

Any error thrown by `fetcher` is propagated to the caller.
