# Function: getMonitorServiceFactory()

> **getMonitorServiceFactory**(`type`): `undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MonitorTypeRegistry.ts#L110)

Get service factory for a monitor type.

## Parameters

### type

`string`

Monitor type

## Returns

`undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Service factory function or undefined
