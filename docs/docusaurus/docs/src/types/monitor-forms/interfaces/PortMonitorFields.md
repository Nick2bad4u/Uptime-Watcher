# Interface: PortMonitorFields

Defined in: [src/types/monitor-forms.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L127)

Port monitor specific fields

## Extends

- [`BaseMonitorFields`](BaseMonitorFields.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitor-forms.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L13)

Check interval in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`checkInterval`](BaseMonitorFields.md#checkinterval)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/monitor-forms.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L15)

Monitor name

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`name`](BaseMonitorFields.md#name)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitor-forms.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L17)

Number of retry attempts

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`retryAttempts`](BaseMonitorFields.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitor-forms.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L19)

Timeout in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`timeout`](BaseMonitorFields.md#timeout)

***

### connectionType?

> `optional` **connectionType**: `"tcp"` \| `"udp"`

Defined in: [src/types/monitor-forms.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L129)

Connection type

***

### host

> **host**: `string`

Defined in: [src/types/monitor-forms.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L131)

Host to monitor

***

### port

> **port**: `number`

Defined in: [src/types/monitor-forms.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L133)

Port number
