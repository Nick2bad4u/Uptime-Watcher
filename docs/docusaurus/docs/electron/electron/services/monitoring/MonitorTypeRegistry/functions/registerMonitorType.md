# Function: registerMonitorType()

> **registerMonitorType**(`config`): `void`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:199](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L199)

Registers a new monitor type with its configuration.

## Parameters

### config

[`BaseMonitorConfig`](../interfaces/BaseMonitorConfig.md)

The monitor type configuration object to register.

## Returns

`void`

## Remarks

Adds the provided [BaseMonitorConfig](../interfaces/BaseMonitorConfig.md) to the internal registry, making it available for use in the system.
