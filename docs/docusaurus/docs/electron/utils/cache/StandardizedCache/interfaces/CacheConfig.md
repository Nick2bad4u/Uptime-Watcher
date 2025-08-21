# Interface: CacheConfig

Defined in: [electron/utils/cache/StandardizedCache.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L21)

Cache configuration.

## Properties

### defaultTTL?

> `optional` **defaultTTL**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L25)

Default TTL in milliseconds. Set to 0 or negative to disable expiration.

***

### enableStats?

> `optional` **enableStats**: `boolean`

Defined in: [electron/utils/cache/StandardizedCache.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L27)

Enable statistics tracking

***

### eventEmitter?

> `optional` **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/utils/cache/StandardizedCache.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L29)

Event emitter for cache events

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [electron/utils/cache/StandardizedCache.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L31)

Maximum cache size

***

### name

> **name**: `string`

Defined in: [electron/utils/cache/StandardizedCache.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/cache/StandardizedCache.ts#L33)

Cache identifier for logging
