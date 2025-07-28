# Function: getMonitorRetryAttempts()

> **getMonitorRetryAttempts**(`monitor`, `defaultRetryAttempts`): `number`

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/monitorTypeGuards.ts#L19)

Safely extracts retry attempts from monitor configuration.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration

### defaultRetryAttempts

`number`

Default retry attempts to use if monitor doesn't have them

## Returns

`number`

The retry attempts value to use
