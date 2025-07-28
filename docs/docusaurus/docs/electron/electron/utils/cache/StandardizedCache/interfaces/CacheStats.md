# Interface: CacheStats

Defined in: [electron/utils/cache/StandardizedCache.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L45)

Cache statistics.

## Properties

### hitRatio

> **hitRatio**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L50)

Hit ratio (0-1).
Calculated as hits / (hits + misses).

***

### hits

> **hits**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L52)

Total cache hits

***

### lastAccess?

> `optional` **lastAccess**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L54)

Last access timestamp. Only updated on cache hits, not misses.

***

### misses

> **misses**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L56)

Total cache misses

***

### size

> **size**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L58)

Current cache size
