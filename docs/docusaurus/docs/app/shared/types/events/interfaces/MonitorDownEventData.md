# Interface: MonitorDownEventData

Defined in: [shared/types/events.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L25)

Event data when a monitor goes down

## Properties

### monitor

> **monitor**: [`Monitor`](../../interfaces/Monitor.md)

Defined in: [shared/types/events.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L27)

Monitor that went down

***

### site

> **site**: [`Site`](../../interfaces/Site.md)

Defined in: [shared/types/events.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L29)

Site containing the monitor

***

### siteId

> **siteId**: `string`

Defined in: [shared/types/events.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L31)

Site identifier

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L33)

Timestamp when the event occurred
