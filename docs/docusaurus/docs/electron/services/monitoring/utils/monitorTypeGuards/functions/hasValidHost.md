# Function: hasValidHost()

> **hasValidHost**(`monitor`): `monitor is Monitor & ` host: string ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L92)

Type guard to safely check if a monitor has a valid host using validator.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` host: string ``

True if the monitor has a valid host, false otherwise
