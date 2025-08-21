# Interface: BaseEventData

Defined in: [shared/types/events.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L20)

Base interface for all event data payloads.

## Remarks

Provides common timestamp field that all events must include. All event
interfaces should extend this base interface to ensure consistency.

## Extended by

- [`CacheInvalidatedEventData`](CacheInvalidatedEventData.md)
- [`DatabaseConnectionEventData`](DatabaseConnectionEventData.md)
- [`DatabaseErrorEventData`](DatabaseErrorEventData.md)
- [`DatabaseRetryEventData`](DatabaseRetryEventData.md)
- [`DatabaseSuccessEventData`](DatabaseSuccessEventData.md)
- [`MonitorDownEventData`](MonitorDownEventData.md)
- [`MonitoringControlEventData`](MonitoringControlEventData.md)
- [`MonitorUpEventData`](MonitorUpEventData.md)

## Properties

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/events.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L24)

The time (in ms since epoch) when the event occurred.
