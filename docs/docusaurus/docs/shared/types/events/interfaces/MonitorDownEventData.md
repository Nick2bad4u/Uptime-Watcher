# Interface: MonitorDownEventData

Defined in: [shared/types/events.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L207)

Payload for events when a monitor goes down (unavailable).

## Remarks

Emitted when a monitored endpoint or service is detected as down.

- `monitor`: The monitor that went down.
- `site`: The site containing the monitor.
- `siteId`: The unique identifier of the site.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

```typescript
const event: MonitorDownEventData = {
    monitor,
    site,
    siteId: site.id,
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

### monitor

> **monitor**: [`Monitor`](../../interfaces/Monitor.md)

Defined in: [shared/types/events.ts:211](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L211)

The monitor that went down.

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:215](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L215)

The site containing the monitor.

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:219](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L219)

The unique identifier of the site.
