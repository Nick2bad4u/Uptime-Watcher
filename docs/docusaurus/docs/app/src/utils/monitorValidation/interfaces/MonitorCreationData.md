# Interface: MonitorCreationData

Defined in: [src/utils/monitorValidation.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L20)

Required fields for monitor creation, ensuring type safety.
Prevents runtime errors by guaranteeing essential properties are present.

## Extends

- [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`Monitor`](../../../../shared/types/interfaces/Monitor.md), `"history"` \| `"monitoring"` \| `"responseTime"` \| `"retryAttempts"` \| `"status"` \| `"timeout"` \| `"type"`\>

## Indexable

\[`key`: `string`\]: `unknown`

Additional fields provided during creation

## Properties

### history

> **history**: [`StatusHistory`](../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [shared/types.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L93)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`history`](../../../../shared/types/interfaces/Monitor.md#history)

***

### monitoring

> **monitoring**: `boolean`

Defined in: [shared/types.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L97)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`monitoring`](../../../../shared/types/interfaces/Monitor.md#monitoring)

***

### responseTime

> **responseTime**: `number`

Defined in: [shared/types.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L99)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`responseTime`](../../../../shared/types/interfaces/Monitor.md#responsetime)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L100)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`retryAttempts`](../../../../shared/types/interfaces/Monitor.md#retryattempts)

***

### status

> **status**: [`MonitorStatus`](../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [shared/types.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L101)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`status`](../../../../shared/types/interfaces/Monitor.md#status)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L102)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`timeout`](../../../../shared/types/interfaces/Monitor.md#timeout)

***

### type

> **type**: `"http"` \| `"port"`

Defined in: [shared/types.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L103)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`type`](../../../../shared/types/interfaces/Monitor.md#type)
