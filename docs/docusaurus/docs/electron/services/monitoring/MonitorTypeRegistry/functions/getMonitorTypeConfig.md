# Function: getMonitorTypeConfig()

> **getMonitorTypeConfig**(`type`): `undefined` \| [`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:157](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L157)

Gets the configuration object for a given monitor type.

## Parameters

### type

`string`

The monitor type identifier.

## Returns

`undefined` \| [`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

Monitor configuration object or undefined if the type is not
  registered.

## Remarks

Returns the [BaseMonitorConfig](../interfaces/BaseMonitorConfig.md) for the specified type, or undefined if
not registered.
