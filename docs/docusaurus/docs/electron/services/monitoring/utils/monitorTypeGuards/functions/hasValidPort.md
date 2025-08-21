# Function: hasValidPort()

> **hasValidPort**(`monitor`): `monitor is Monitor & ` port: number ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L110)

Type guard to safely check if a monitor has a valid port.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` port: number ``

True if the monitor has a valid port, false otherwise
