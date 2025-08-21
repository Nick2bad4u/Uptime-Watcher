# Function: createSiteCache()

> **createSiteCache**(): [`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/utils/database/serviceFactory.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L60)

Factory function to create a standardized site cache.

Creates a temporary cache instance optimized for site operations with
appropriate TTL and size limits for temporary data storage. Statistics are
disabled for performance in temporary use cases.

## Returns

[`StandardizedCache`](../../../cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

New StandardizedCache instance configured for temporary site storage
