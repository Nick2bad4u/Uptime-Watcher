# shared/types/events

Defines event payload types for improved type safety in IPC event callbacks.

## Remarks

These interfaces replace generic `unknown` types, ensuring strict typing for
all event payloads exchanged between the Electron main process and renderer.

## Interfaces

- [BaseEventData](interfaces/BaseEventData.md)
- [CacheInvalidatedEventData](interfaces/CacheInvalidatedEventData.md)
- [DatabaseConnectionEventData](interfaces/DatabaseConnectionEventData.md)
- [DatabaseErrorEventData](interfaces/DatabaseErrorEventData.md)
- [DatabaseRetryEventData](interfaces/DatabaseRetryEventData.md)
- [DatabaseSuccessEventData](interfaces/DatabaseSuccessEventData.md)
- [MonitorDownEventData](interfaces/MonitorDownEventData.md)
- [MonitoringControlEventData](interfaces/MonitoringControlEventData.md)
- [MonitorUpEventData](interfaces/MonitorUpEventData.md)
- [UpdateStatusEventData](interfaces/UpdateStatusEventData.md)

## Type Aliases

- [DatabaseOperation](type-aliases/DatabaseOperation.md)
- [TestEventData](type-aliases/TestEventData.md)
