# Interface: MonitoringControlEventData

Defined in: [shared/types/events.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L114)

Payload for monitoring control events (global monitoring start/stop).

## Remarks

Used to signal global monitoring state changes, such as starting or stopping all monitors.
- `activeMonitors`: Number of active monitors (for stopped events).
- `monitorCount`: Number of monitors involved in the operation.
- `reason`: Reason for stopping (for stopped events).
- `siteCount`: Number of sites involved in the operation.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

// Example: Monitoring stopped by user
```typescript
const event: MonitoringControlEventData = {
  reason: 'user',
  activeMonitors: 0,
  siteCount: 3,
  timestamp: Date.now()
};
```

## Properties

### activeMonitors?

> `optional` **activeMonitors**: `number`

Defined in: [shared/types/events.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L118)

Number of active monitors (for stopped events).

***

### monitorCount?

> `optional` **monitorCount**: `number`

Defined in: [shared/types/events.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L122)

Number of monitors involved in the operation.

***

### reason?

> `optional` **reason**: `"error"` \| `"shutdown"` \| `"user"`

Defined in: [shared/types/events.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L127)

Reason for stopping (for stopped events).

#### Remarks

Can be 'error', 'shutdown', or 'user'.

***

### siteCount?

> `optional` **siteCount**: `number`

Defined in: [shared/types/events.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L131)

Number of sites involved in the operation.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L135)

The time (in ms since epoch) when the event occurred.
