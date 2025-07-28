# Interface: MonitorDownEventData

Defined in: [shared/types/events.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L73)

Payload for events when a monitor goes down (unavailable).

## Remarks

Emitted when a monitored endpoint or service is detected as down.
- `monitor`: The monitor that went down.
- `site`: The site containing the monitor.
- `siteId`: The unique identifier of the site.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

// Example event payload for a monitor down event
```typescript
const event: MonitorDownEventData = {
  monitor,
  site,
  siteId: site.id,
  timestamp: Date.now()
};
```

## Properties

### monitor

> **monitor**: [`Monitor`](../../interfaces/Monitor.md)

Defined in: [shared/types/events.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L77)

The monitor that went down.

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L81)

The site containing the monitor.

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L85)

The unique identifier of the site.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L89)

The time (in ms since epoch) when the event occurred.
