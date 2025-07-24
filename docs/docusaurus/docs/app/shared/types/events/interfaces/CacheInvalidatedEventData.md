# Interface: CacheInvalidatedEventData

Defined in: [shared/types/events.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L11)

Event data for cache invalidation

## Properties

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/events.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L13)

Specific identifier affected (optional for global invalidation)

***

### reason

> **reason**: `"delete"` \| `"expiry"` \| `"manual"` \| `"update"`

Defined in: [shared/types/events.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L15)

Reason for invalidation

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L17)

Timestamp when invalidation occurred

***

### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

Defined in: [shared/types/events.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L19)

Type of cache invalidation
