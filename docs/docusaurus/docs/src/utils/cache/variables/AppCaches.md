# Variable: AppCaches

> `const` **AppCaches**: `AppCachesInterface`

Defined in: [src/utils/cache.ts:293](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/cache.ts#L293)

Application-wide predefined cache instances used throughout the app.

## Remarks

Each cache is tuned with conservative `maxSize` and `ttl` values suitable for
its domain. Consumers can use these shared caches or create their own
[TypedCache](../classes/TypedCache.md) instances when different characteristics are needed.
