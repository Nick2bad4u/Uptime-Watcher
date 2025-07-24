# Interface: MonitorUpEventData

Defined in: [src/types/events.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L49)

Event data when a monitor comes back up

## Properties

### monitor

> **monitor**: [`Monitor`](../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/types/events.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L51)

Monitor that came back up

***

### responseTime?

> `optional` **responseTime**: `number`

Defined in: [src/types/events.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L53)

Response time in milliseconds

***

### site

> **site**: [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [src/types/events.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L55)

Site containing the monitor

***

### siteId

> **siteId**: `string`

Defined in: [src/types/events.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L57)

Site identifier

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/events.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/types/events.ts#L59)

Timestamp when the event occurred
