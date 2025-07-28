# Function: getMonitorTimeout()

> **getMonitorTimeout**(`monitor`, `defaultTimeout`): `number`

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/monitorTypeGuards.ts#L30)

Safely extracts timeout value from monitor configuration.

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration

### defaultTimeout

`number`

Default timeout to use if monitor doesn't have one

## Returns

`number`

The timeout value to use
