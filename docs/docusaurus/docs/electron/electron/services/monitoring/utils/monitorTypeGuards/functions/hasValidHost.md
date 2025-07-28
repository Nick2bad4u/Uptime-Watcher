# Function: hasValidHost()

> **hasValidHost**(`monitor`): `monitor is Monitor & ` host: string ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/monitorTypeGuards.ts#L40)

Type guard to safely check if a monitor has a valid host.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` host: string ``

True if the monitor has a valid host, false otherwise
