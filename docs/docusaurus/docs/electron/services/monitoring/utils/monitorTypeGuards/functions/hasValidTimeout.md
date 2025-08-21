# Function: hasValidTimeout()

> **hasValidTimeout**(`monitor`): `monitor is Monitor & ` timeout: number ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L42)

Type guard to safely check if a monitor has a valid timeout value.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` timeout: number ``

True if the monitor has a valid timeout, false otherwise
