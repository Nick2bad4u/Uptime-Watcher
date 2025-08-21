# Interface: BaseMonitorConfig

Defined in: [shared/types/monitorConfig.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L90)

Base monitor configuration interface that all monitor configurations extend.

## Remarks

Contains common configuration fields that all monitor types require.

## Extended by

- [`HttpMonitorConfig`](HttpMonitorConfig.md)
- [`PingMonitorConfig`](PingMonitorConfig.md)
- [`PortMonitorConfig`](PortMonitorConfig.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/monitorConfig.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L92)

Interval between checks in milliseconds

***

### enabled

> **enabled**: `boolean`

Defined in: [shared/types/monitorConfig.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L94)

Whether the monitor is enabled

***

### id

> **id**: `string`

Defined in: [shared/types/monitorConfig.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L96)

Unique identifier for the monitor

***

### name

> **name**: `string`

Defined in: [shared/types/monitorConfig.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L98)

Human-readable name for the monitor

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/monitorConfig.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L100)

Number of retry attempts when a check fails

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/monitorConfig.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L102)

Timeout for the monitor check in milliseconds

***

### type

> **type**: `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [shared/types/monitorConfig.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L104)

The type of monitor
