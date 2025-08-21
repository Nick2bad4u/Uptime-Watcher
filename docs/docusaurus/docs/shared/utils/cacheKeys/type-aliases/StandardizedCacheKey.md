# Type Alias: StandardizedCacheKey

> **StandardizedCacheKey** = [`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)\<*typeof* `CacheKeys.config.byName` \| *typeof* `CacheKeys.config.validation` \| *typeof* `CacheKeys.monitor.byId` \| *typeof* `CacheKeys.monitor.bySite` \| *typeof* `CacheKeys.monitor.operation` \| *typeof* `CacheKeys.site.bulkOperation` \| *typeof* `CacheKeys.site.byIdentifier` \| *typeof* `CacheKeys.site.loading` \| *typeof* `CacheKeys.validation.byType` \| *typeof* `CacheKeys.validation.monitorType`\>

Defined in: [shared/utils/cacheKeys.ts:291](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/cacheKeys.ts#L291)

Type representing all possible cache key patterns.

## Remarks

Provides type safety for cache key validation and ensures only standardized
keys are used throughout the application.
