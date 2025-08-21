# Interface: PingFormData

Defined in: [shared/types/formData.ts:162](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L162)

Form data interface for ping monitors.

## Remarks

Used for monitors that check host reachability via ICMP ping.

## Extends

- [`BaseFormData`](BaseFormData.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/formData.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L46)

Interval between checks in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`checkInterval`](BaseFormData.md#checkinterval)

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [shared/types/formData.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L48)

Whether the monitor is enabled

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`enabled`](BaseFormData.md#enabled)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/formData.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L50)

Number of retry attempts when a check fails

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`retryAttempts`](BaseFormData.md#retryattempts)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/formData.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L52)

Timeout for the monitor check in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`timeout`](BaseFormData.md#timeout)

***

### host

> **host**: `string`

Defined in: [shared/types/formData.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L164)

The hostname or IP address to ping

***

### maxPacketLoss?

> `optional` **maxPacketLoss**: `number`

Defined in: [shared/types/formData.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L166)

Maximum allowed packet loss percentage

***

### packetCount?

> `optional` **packetCount**: `number`

Defined in: [shared/types/formData.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L168)

Number of ping packets to send

***

### packetSize?

> `optional` **packetSize**: `number`

Defined in: [shared/types/formData.ts:170](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L170)

Size of ping packets in bytes

***

### type

> **type**: `"ping"`

Defined in: [shared/types/formData.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L171)

The type of monitor (http, port, ping)

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)
