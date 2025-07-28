# Interface: MonitorUpEventData

Defined in: [shared/types/events.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L159)

Payload for events when a monitor comes back up (becomes available).

## Remarks

Emitted when a previously down monitor is detected as up.
- `monitor`: The monitor that came back up.
- `site`: The site containing the monitor.
- `siteId`: The unique identifier of the site.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

// Example event payload for a monitor up event
```typescript
const event: MonitorUpEventData = {
  monitor,
  site,
  siteId: site.id,
  timestamp: Date.now()
};
```

## Properties

### monitor

> **monitor**: [`Monitor`](../../interfaces/Monitor.md)

Defined in: [shared/types/events.ts:163](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L163)

The monitor that came back up.

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:167](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L167)

The site containing the monitor.

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L171)

The unique identifier of the site.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:175](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L175)

The time (in ms since epoch) when the event occurred.
