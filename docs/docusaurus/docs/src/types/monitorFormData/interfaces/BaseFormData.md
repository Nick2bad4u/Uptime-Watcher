# Interface: BaseFormData

Defined in: [src/types/monitorFormData.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L16)

Base form data interface with common properties.

## Extended by

- [`HttpFormData`](HttpFormData.md)
- [`PingFormData`](PingFormData.md)
- [`PortFormData`](PortFormData.md)
- [`DnsFormData`](DnsFormData.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitorFormData.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L18)

Monitor check interval in milliseconds

***

### monitoring?

> `optional` **monitoring**: `boolean`

Defined in: [src/types/monitorFormData.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L20)

Whether monitoring is enabled

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitorFormData.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L22)

Number of retry attempts on failure

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitorFormData.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L24)

Request timeout in milliseconds

***

### type?

> `optional` **type**: `string`

Defined in: [src/types/monitorFormData.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitorFormData.ts#L26)

Monitor type identifier
