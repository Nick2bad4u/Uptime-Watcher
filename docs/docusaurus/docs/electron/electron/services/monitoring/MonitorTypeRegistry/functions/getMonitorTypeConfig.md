# Function: getMonitorTypeConfig()

> **getMonitorTypeConfig**(`type`): `undefined` \| [`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L159)

Gets the configuration object for a given monitor type.

## Parameters

### type

`string`

The monitor type identifier.

## Returns

`undefined` \| [`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

Monitor configuration object or undefined if the type is not registered.

## Remarks

Returns the [BaseMonitorConfig](../interfaces/BaseMonitorConfig.md) for the specified type, or undefined if not registered.
