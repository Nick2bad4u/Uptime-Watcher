# Interface: CacheInvalidatedEventData

Defined in: [shared/types/events.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L30)

Payload for cache invalidation events.

## Remarks

Used to notify listeners that a cache entry or the entire cache has been invalidated for a specific reason.
- `identifier`: The specific identifier affected (optional for global invalidation).
- `reason`: The reason for invalidation.
- `timestamp`: The time (in ms since epoch) when invalidation occurred.
- `type`: The type of cache invalidation.

## Example

// Invalidate all site caches due to manual action
```typescript
const event: CacheInvalidatedEventData = {
  type: 'all',
  reason: 'manual',
  timestamp: Date.now()
};
```

## Properties

### identifier?

> `optional` **identifier**: `string`

Defined in: [shared/types/events.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L35)

The specific identifier affected (optional for global invalidation).

#### Remarks

If omitted, the invalidation is considered global.

***

### reason

> **reason**: `"manual"` \| `"delete"` \| `"expiry"` \| `"update"`

Defined in: [shared/types/events.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L40)

The reason for invalidation.

#### Remarks

Can be 'delete', 'expiry', 'manual', or 'update'.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L44)

The time (in ms since epoch) when invalidation occurred.

***

### type

> **type**: `"all"` \| `"monitor"` \| `"site"`

Defined in: [shared/types/events.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L49)

The type of cache invalidation.

#### Remarks

'all' for global, 'monitor' for a specific monitor, 'site' for a specific site.
