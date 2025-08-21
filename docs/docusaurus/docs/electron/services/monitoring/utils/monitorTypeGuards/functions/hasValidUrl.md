# Function: hasValidUrl()

> **hasValidUrl**(`monitor`): `monitor is Monitor & ` url: string ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L127)

Type guard to safely check if a monitor has a valid URL using validator.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` url: string ``

True if the monitor has a valid URL, false otherwise
