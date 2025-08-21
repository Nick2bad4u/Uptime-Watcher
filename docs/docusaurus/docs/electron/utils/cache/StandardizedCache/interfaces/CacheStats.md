# Interface: CacheStats

Defined in: [electron/utils/cache/StandardizedCache.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L53)

Cache statistics.

## Properties

### hitRatio

> **hitRatio**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L57)

Hit ratio (0-1). Calculated as hits / (hits + misses).

***

### hits

> **hits**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L59)

Total cache hits

***

### lastAccess?

> `optional` **lastAccess**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L61)

Last access timestamp. Only updated on cache hits, not misses.

***

### misses

> **misses**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L63)

Total cache misses

***

### size

> **size**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L65)

Current cache size
