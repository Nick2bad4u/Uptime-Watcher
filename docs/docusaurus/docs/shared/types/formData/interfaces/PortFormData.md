# Interface: PortFormData

Defined in: [shared/types/formData.ts:182](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L182)

Form data interface for port monitors.

## Remarks

Used for monitors that check TCP port connectivity.

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

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: [shared/types/formData.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L184)

Connection timeout in milliseconds (separate from check timeout)

***

### host

> **host**: `string`

Defined in: [shared/types/formData.ts:186](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L186)

The hostname or IP address to monitor

***

### port

> **port**: `number`

Defined in: [shared/types/formData.ts:188](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L188)

The port number to check

***

### type

> **type**: `"port"`

Defined in: [shared/types/formData.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L189)

The type of monitor (http, port, ping)

#### Overrides

[`BaseFormData`](BaseFormData.md).[`type`](BaseFormData.md#type)
