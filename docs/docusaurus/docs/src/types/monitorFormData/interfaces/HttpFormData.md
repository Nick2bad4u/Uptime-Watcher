# Interface: HttpFormData

Defined in: [src/types/monitorFormData.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L44)

Form data for HTTP monitors.

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

### type

> **type**: `"http"`

Defined in: [src/types/monitorFormData.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L45)

Monitor type identifier

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)

***

### url

> **url**: `string`

Defined in: [src/types/monitorFormData.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L47)

Target URL to monitor
