# Interface: PortFormData

Defined in: [src/types/monitorFormData.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L58)

Form data for port monitors.

## Extends

- [`BaseFormData`](BaseFormData.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitorFormData.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L18)

Monitor check interval in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`checkInterval`](BaseFormData.md#checkinterval)

***

### host

> **host**: `string`

Defined in: [src/types/monitorFormData.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L60)

Target host to monitor

***

### monitoring?

> `optional` **monitoring**: `boolean`

Defined in: [src/types/monitorFormData.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L20)

Whether monitoring is enabled

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`monitoring`](BaseFormData.md#monitoring)

***

### port

> **port**: `number`

Defined in: [src/types/monitorFormData.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L62)

Target port to monitor

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitorFormData.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L22)

Number of retry attempts on failure

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`retryAttempts`](BaseFormData.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitorFormData.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L24)

Request timeout in milliseconds

#### Inherited from

[`BaseFormData`](BaseFormData.md).[`timeout`](BaseFormData.md#timeout)

***

### type

> **type**: `"port"`

Defined in: [src/types/monitorFormData.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L63)

Monitor type identifier

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)
