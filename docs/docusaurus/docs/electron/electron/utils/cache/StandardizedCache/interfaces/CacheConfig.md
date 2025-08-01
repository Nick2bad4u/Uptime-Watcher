# Interface: CacheConfig

Defined in: [electron/utils/cache/StandardizedCache.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L15)

Cache configuration.

## Properties

### defaultTTL?

> `optional` **defaultTTL**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L17)

Default TTL in milliseconds. Set to 0 or negative to disable expiration.

***

### enableStats?

> `optional` **enableStats**: `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L19)

Enable statistics tracking

***

### eventEmitter?

> `optional` **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/cache/StandardizedCache.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L21)

Event emitter for cache events

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L23)

Maximum cache size

***

### name

> **name**: `string`

Defined in: [electron/utils/cache/StandardizedCache.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/cache/StandardizedCache.ts#L25)

Cache identifier for logging
