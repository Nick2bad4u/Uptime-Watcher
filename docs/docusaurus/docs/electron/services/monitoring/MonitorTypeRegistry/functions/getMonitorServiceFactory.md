# Function: getMonitorServiceFactory()

> **getMonitorServiceFactory**(`type`): `undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:270](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L270)

Gets the service factory function for a given monitor type.

## Parameters

### type

`string`

The monitor type identifier.

## Returns

`undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Service factory function or undefined if the type is not registered.

## Remarks

Returns the factory function for creating monitor service instances for the
specified type, or undefined if not registered.
