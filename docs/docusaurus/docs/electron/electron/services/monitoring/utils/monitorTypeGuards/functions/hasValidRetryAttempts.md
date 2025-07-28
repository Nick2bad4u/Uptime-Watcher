# Function: hasValidRetryAttempts()

> **hasValidRetryAttempts**(`monitor`): `monitor is Monitor & ` retryAttempts: number ``

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/monitorTypeGuards.ts#L60)

Type guard to safely check if a monitor has valid retry attempts.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

## Returns

`monitor is Monitor & ` retryAttempts: number ``

True if the monitor has valid retry attempts, false otherwise
