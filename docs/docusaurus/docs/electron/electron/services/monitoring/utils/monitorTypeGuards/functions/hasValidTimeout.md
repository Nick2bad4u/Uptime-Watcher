# Function: hasValidTimeout()

> **hasValidTimeout**(`monitor`): `monitor is Monitor & ` timeout: number ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/monitorTypeGuards.ts#L72)

Type guard to safely check if a monitor has a valid timeout value.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` timeout: number ``

True if the monitor has a valid timeout, false otherwise
