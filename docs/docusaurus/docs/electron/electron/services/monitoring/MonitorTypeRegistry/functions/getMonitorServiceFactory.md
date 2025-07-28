# Function: getMonitorServiceFactory()

> **getMonitorServiceFactory**(`type`): `undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L144)

Gets the service factory function for a given monitor type.

## Parameters

### type

`string`

The monitor type identifier.

## Returns

`undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Service factory function or undefined if the type is not registered.

## Remarks

Returns the factory function for creating monitor service instances for the specified type, or undefined if not registered.
