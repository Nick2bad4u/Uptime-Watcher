# Interface: PortMonitorConfig

Defined in: [shared/types/monitorConfig.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L229)

Configuration interface for port monitors.

## Remarks

Used for monitors that check TCP port connectivity.

## Extends

- [`BaseMonitorConfig`](BaseMonitorConfig.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/monitorConfig.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L92)

Interval between checks in milliseconds

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`checkInterval`](BaseMonitorConfig.md#checkinterval)

***

### enabled

> **enabled**: `boolean`

Defined in: [shared/types/monitorConfig.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L94)

Whether the monitor is enabled

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`enabled`](BaseMonitorConfig.md#enabled)

***

### id

> **id**: `string`

Defined in: [shared/types/monitorConfig.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L96)

Unique identifier for the monitor

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`id`](BaseMonitorConfig.md#id)

***

### name

> **name**: `string`

Defined in: [shared/types/monitorConfig.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L98)

Human-readable name for the monitor

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`name`](BaseMonitorConfig.md#name)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/monitorConfig.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L100)

Number of retry attempts when a check fails

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`retryAttempts`](BaseMonitorConfig.md#retryattempts)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/monitorConfig.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L102)

Timeout for the monitor check in milliseconds

#### Inherited from

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`timeout`](BaseMonitorConfig.md#timeout)

***

### connectionTimeout

> **connectionTimeout**: `number`

Defined in: [shared/types/monitorConfig.ts:231](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L231)

Connection timeout in milliseconds

***

### host

> **host**: `string`

Defined in: [shared/types/monitorConfig.ts:233](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L233)

The hostname or IP address to monitor

***

### ipVersion?

> `optional` **ipVersion**: `"ipv4"` \| `"ipv6"`

Defined in: [shared/types/monitorConfig.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L235)

Internet Protocol version to use

***

### port

> **port**: `number`

Defined in: [shared/types/monitorConfig.ts:237](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L237)

The port number to check

***

### protocol?

> `optional` **protocol**: `object`

Defined in: [shared/types/monitorConfig.ts:239](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L239)

Protocol-specific configuration

#### expectedResponse?

> `optional` **expectedResponse**: `string`

Expected response data patterns

#### sendData?

> `optional` **sendData**: `string`

Custom data to send after connection

#### useTls?

> `optional` **useTls**: `boolean`

Whether to use TLS/SSL encryption

***

### type

> **type**: `"port"`

Defined in: [shared/types/monitorConfig.ts:247](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L247)

The type of monitor

#### Overrides

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`type`](BaseMonitorConfig.md#type)
