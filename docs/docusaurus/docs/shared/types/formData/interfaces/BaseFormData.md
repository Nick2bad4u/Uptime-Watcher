# Interface: BaseFormData

Defined in: [shared/types/formData.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L44)

Base form data interface that all monitor form data types extend.

## Remarks

Contains common fields that all monitor types require regardless of their
specific type.

## Extended by

- [`HttpFormData`](HttpFormData.md)
- [`PingFormData`](PingFormData.md)
- [`PortFormData`](PortFormData.md)

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [shared/types/formData.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L46)

Interval between checks in milliseconds

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [shared/types/formData.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L48)

Whether the monitor is enabled

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types/formData.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L50)

Number of retry attempts when a check fails

***

### timeout

> **timeout**: `number`

Defined in: [shared/types/formData.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L52)

Timeout for the monitor check in milliseconds

***

### type

> **type**: `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [shared/types/formData.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L54)

The type of monitor (http, port, ping)
