# Interface: MonitoringControlEventData

Defined in: [shared/types/events.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L246)

Payload for monitoring control events (global monitoring start/stop).

## Remarks

Used to signal global monitoring state changes, such as starting or stopping
all monitors. - `activeMonitors`: Number of active monitors (for stopped
events).

- `monitorCount`: Number of monitors involved in the operation.
- `reason`: Reason for stopping (for stopped events).
- `siteCount`: Number of sites involved in the operation.
- `timestamp`: The time (in ms since epoch) when the event occurred.

## Example

```typescript
const event: MonitoringControlEventData = {
    reason: "user",
    activeMonitors: 0,
    siteCount: 3,
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

### activeMonitors?

> `optional` **activeMonitors**: `number`

Defined in: [shared/types/events.ts:250](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L250)

Number of active monitors (for stopped events).

***

### monitorCount?

> `optional` **monitorCount**: `number`

Defined in: [shared/types/events.ts:254](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L254)

Number of monitors involved in the operation.

***

### reason?

> `optional` **reason**: `"error"` \| `"shutdown"` \| `"user"`

Defined in: [shared/types/events.ts:261](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L261)

Reason for stopping (for stopped events).

#### Remarks

Can be 'error', 'shutdown', or 'user'.

***

### siteCount?

> `optional` **siteCount**: `number`

Defined in: [shared/types/events.ts:265](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L265)

Number of sites involved in the operation.
