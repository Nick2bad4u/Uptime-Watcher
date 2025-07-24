# Interface: PortMonitorFields

Defined in: [src/types/monitor-forms.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L95)

Port monitor specific fields

## Extends

- [`BaseMonitorFields`](BaseMonitorFields.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitor-forms.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L13)

Check interval in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`checkInterval`](BaseMonitorFields.md#checkinterval)

***

### connectionType?

> `optional` **connectionType**: `"tcp"` \| `"udp"`

Defined in: [src/types/monitor-forms.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L97)

Connection type

***

### host

> **host**: `string`

Defined in: [src/types/monitor-forms.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L99)

Host to monitor

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/monitor-forms.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L15)

Monitor name

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`name`](BaseMonitorFields.md#name)

***

### port

> **port**: `number`

Defined in: [src/types/monitor-forms.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L101)

Port number

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitor-forms.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L17)

Number of retry attempts

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`retryAttempts`](BaseMonitorFields.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitor-forms.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/types/monitor-forms.ts#L19)

Timeout in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`timeout`](BaseMonitorFields.md#timeout)
