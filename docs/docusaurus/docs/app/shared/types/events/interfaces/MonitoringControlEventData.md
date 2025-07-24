# Interface: MonitoringControlEventData

Defined in: [shared/types/events.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L39)

Event data for monitoring control operations (global monitoring start/stop)

## Properties

### activeMonitors?

> `optional` **activeMonitors**: `number`

Defined in: [shared/types/events.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L41)

Number of active monitors (for stopped events)

***

### monitorCount?

> `optional` **monitorCount**: `number`

Defined in: [shared/types/events.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L43)

Number of monitors involved

***

### reason?

> `optional` **reason**: `"error"` \| `"shutdown"` \| `"user"`

Defined in: [shared/types/events.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L45)

Reason for stopping (for stopped events)

***

### siteCount?

> `optional` **siteCount**: `number`

Defined in: [shared/types/events.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L47)

Number of sites involved

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types/events.ts#L49)

Timestamp when the event occurred
