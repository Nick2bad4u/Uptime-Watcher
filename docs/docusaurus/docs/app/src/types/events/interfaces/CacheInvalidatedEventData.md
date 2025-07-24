# Interface: CacheInvalidatedEventData

Defined in: [src/types/events.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L11)

Event data for cache invalidation

## Properties

### identifier?

> `optional` **identifier**: `string`

Defined in: [src/types/events.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L13)

Specific identifier affected (optional for global invalidation)

***

### reason

> **reason**: `string`

Defined in: [src/types/events.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L15)

Reason for invalidation

***

### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

Defined in: [src/types/events.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L17)

Type of cache invalidation
