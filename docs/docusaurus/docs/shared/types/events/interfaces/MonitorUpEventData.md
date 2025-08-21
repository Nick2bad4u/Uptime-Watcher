# Interface: MonitorUpEventData

Defined in: [shared/types/events.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L290)

Payload for events when a monitor comes back up (becomes available).

## Remarks

Emitted when a previously down monitor is detected as up.

- `monitor`: The monitor that came back up.
- `site`: The site containing the monitor.
- `siteId`: The unique identifier of the site.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

```typescript
const event: MonitorUpEventData = {
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

Defined in: [shared/types/events.ts:294](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L294)

The monitor that came back up.

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:298](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L298)

The site containing the monitor.

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L302)

The unique identifier of the site.
