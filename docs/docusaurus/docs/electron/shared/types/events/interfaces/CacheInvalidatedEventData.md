# Interface: CacheInvalidatedEventData

Defined in: [shared/types/events.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/types/events.ts#L11)

Event data for cache invalidation

## Properties

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/events.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/types/events.ts#L13)

Specific identifier affected (optional for global invalidation)

***

### reason

> **reason**: `"manual"` \| `"delete"` \| `"expiry"` \| `"update"`

Defined in: [shared/types/events.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/types/events.ts#L15)

Reason for invalidation

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/types/events.ts#L17)

Timestamp when invalidation occurred

***

### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

Defined in: [shared/types/events.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/types/events.ts#L19)

Type of cache invalidation
