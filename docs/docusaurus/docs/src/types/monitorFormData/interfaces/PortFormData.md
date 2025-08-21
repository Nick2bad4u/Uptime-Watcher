# Interface: PortFormData

Defined in: [src/types/monitorFormData.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L62)

Form data for port monitors.

## Extends

- [`BaseFormData`](BaseFormData.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitorFormData.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L18)

Monitor check interval in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`checkInterval`](BaseFormData.md#checkinterval)

***

### monitoring?

> `optional` **monitoring**: `boolean`

Defined in: [src/types/monitorFormData.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L20)

Whether monitoring is enabled

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`monitoring`](BaseFormData.md#monitoring)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitorFormData.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L22)

Number of retry attempts on failure

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`retryAttempts`](BaseFormData.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitorFormData.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L24)

Request timeout in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`timeout`](BaseFormData.md#timeout)

***

### host

> **host**: `string`

Defined in: [src/types/monitorFormData.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L64)

Target host to monitor

***

### port

> **port**: `number`

Defined in: [src/types/monitorFormData.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L66)

Target port to monitor

***

### type

> **type**: `"port"`

Defined in: [src/types/monitorFormData.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L67)

Monitor type identifier

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)
