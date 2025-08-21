# Function: registerMonitorType()

> **registerMonitorType**(`config`): `void`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:288](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L288)

Registers a new monitor type with its configuration.

## Parameters

### config

[`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

The monitor type configuration object to register.

## Returns

`void`

## Remarks

Adds the provided [BaseMonitorConfig](../interfaces/BaseMonitorConfig.md) to the internal registry, making
it available for use in the system.
