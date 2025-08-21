# Function: hasValidRetryAttempts()

> **hasValidRetryAttempts**(`monitor`): `monitor is Monitor & ` retryAttempts: number ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L25)

Type guard to safely check if a monitor has valid retry attempts.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` retryAttempts: number ``

True if the monitor has valid retry attempts, false otherwise
