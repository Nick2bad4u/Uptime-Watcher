# Function: getMonitorRetryAttempts()

> **getMonitorRetryAttempts**(`monitor`, `defaultRetryAttempts`): `number`

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L61)

Safely extracts retry attempts from monitor configuration.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration

### defaultRetryAttempts

`number`

Default retry attempts to use if monitor
  doesn't have them

## Returns

`number`

The retry attempts value to use
