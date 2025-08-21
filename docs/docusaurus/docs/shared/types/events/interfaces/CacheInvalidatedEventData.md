# Interface: CacheInvalidatedEventData

Defined in: [shared/types/events.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L49)

Payload for cache invalidation events.

## Remarks

Used to notify listeners that a cache entry or the entire cache has been
invalidated for a specific reason. - `identifier`: The specific identifier
affected (optional for global invalidation). - `reason`: The reason for
invalidation.

- `timestamp`: The time (in ms since epoch) when invalidation occurred.
- `type`: The type of cache invalidation.

## Example

```typescript
const event: CacheInvalidatedEventData = {
    type: "all",
    reason: "manual",
    timestamp: Date.now(),
};
```

## Extends

- [`BaseEventData`](BaseEventData.md)

## Properties

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L24)

The time (in ms since epoch) when the event occurred.

#### Inherited from

[`BaseEventData`](BaseEventData.md).[`timestamp`](BaseEventData.md#timestamp)

***

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/events.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L56)

The specific identifier affected (optional for global invalidation).

#### Remarks

If omitted, the invalidation is considered global.

***

### reason

> **reason**: `"delete"` \| `"expiry"` \| `"manual"` \| `"update"`

Defined in: [shared/types/events.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L63)

The reason for invalidation.

#### Remarks

Can be 'delete', 'expiry', 'manual', or 'update'.

***

### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

Defined in: [shared/types/events.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L71)

The type of cache invalidation.

#### Remarks

'all' for global, 'monitor' for a specific monitor, 'site' for a specific
site.
