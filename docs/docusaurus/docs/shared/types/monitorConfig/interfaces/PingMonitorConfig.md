# Interface: PingMonitorConfig

Defined in: [shared/types/monitorConfig.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L195)

Configuration interface for ping monitors.

## Remarks

Used for monitors that check host reachability via ICMP ping.

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

### host

> **host**: `string`

Defined in: [shared/types/monitorConfig.ts:197](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L197)

The hostname or IP address to ping

***

### ipVersion?

> `optional` **ipVersion**: `"ipv4"` \| `"ipv6"`

Defined in: [shared/types/monitorConfig.ts:199](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L199)

Internet Protocol version to use

***

### maxPacketLoss

> **maxPacketLoss**: `number`

Defined in: [shared/types/monitorConfig.ts:201](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L201)

Maximum allowed packet loss percentage (0-100)

***

### maxRtt?

> `optional` **maxRtt**: `number`

Defined in: [shared/types/monitorConfig.ts:203](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L203)

Maximum allowed round trip time in milliseconds

***

### packetCount

> **packetCount**: `number`

Defined in: [shared/types/monitorConfig.ts:205](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L205)

Number of ping packets to send per check

***

### packetSize

> **packetSize**: `number`

Defined in: [shared/types/monitorConfig.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L207)

Size of ping packets in bytes

***

### type

> **type**: `"ping"`

Defined in: [shared/types/monitorConfig.ts:208](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L208)

The type of monitor

#### Overrides

[`BaseMonitorConfig`](BaseMonitorConfig.md).[`type`](BaseMonitorConfig.md#type)
