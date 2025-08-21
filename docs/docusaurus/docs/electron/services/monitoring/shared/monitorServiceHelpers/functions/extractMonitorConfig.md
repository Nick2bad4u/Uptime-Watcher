# Function: extractMonitorConfig()

> **extractMonitorConfig**(`monitor`, `configTimeout?`): `object`

Defined in: [electron/services/monitoring/shared/monitorServiceHelpers.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/shared/monitorServiceHelpers.ts#L45)

Extract common monitor configuration values (timeout and retry attempts)

## Parameters

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration

### configTimeout?

`number`

Default timeout from monitor config

## Returns

`object`

Object containing timeout and retry attempts

### retryAttempts

> **retryAttempts**: `number`

### timeout

> **timeout**: `number`
