# Interface: MonitorDownEventData

Defined in: [src/types/events.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L23)

Event data when a monitor goes down

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/types/events.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L25)

Error message if available

***

### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/types/events.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L27)

Monitor that went down

***

### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [src/types/events.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L29)

Site containing the monitor

***

### siteId

> **siteId**: `string`

Defined in: [src/types/events.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L31)

Site identifier

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/events.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/events.ts#L33)

Timestamp when the event occurred
