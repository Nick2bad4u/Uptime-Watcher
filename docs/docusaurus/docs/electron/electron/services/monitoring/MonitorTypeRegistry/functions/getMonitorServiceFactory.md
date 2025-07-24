# Function: getMonitorServiceFactory()

> **getMonitorServiceFactory**(`type`): `undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L110)

Get service factory for a monitor type.

## Parameters

### type

`string`

Monitor type

## Returns

`undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Service factory function or undefined
