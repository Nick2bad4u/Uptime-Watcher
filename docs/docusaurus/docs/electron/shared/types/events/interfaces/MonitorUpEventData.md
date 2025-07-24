# Interface: MonitorUpEventData

Defined in: [shared/types/events.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L55)

Event data when a monitor comes back up

## Properties

### monitor

> **monitor**: [`Monitor`](../../interfaces/Monitor.md)

Defined in: [shared/types/events.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L57)

Monitor that came back up

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L59)

Site containing the monitor

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L61)

Site identifier

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L63)

Timestamp when the event occurred
