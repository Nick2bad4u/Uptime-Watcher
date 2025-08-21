# Function: getMonitorTimeout()

> **getMonitorTimeout**(`monitor`, `defaultTimeout`): `number`

Defined in: [electron/services/monitoring/utils/monitorTypeGuards.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/monitorTypeGuards.ts#L78)

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
