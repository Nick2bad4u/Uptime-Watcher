# Function: getMonitorServiceFactory()

> **getMonitorServiceFactory**(`type`): `undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/MonitorTypeRegistry.ts#L110)

Get service factory for a monitor type.

## Parameters

### type

`string`

Monitor type

## Returns

`undefined` \| () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Service factory function or undefined
