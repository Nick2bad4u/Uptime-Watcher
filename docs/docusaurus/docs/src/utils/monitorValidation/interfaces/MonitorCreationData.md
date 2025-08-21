# Interface: MonitorCreationData

Defined in: [src/utils/monitorValidation.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L33)

Required fields for monitor creation, ensuring type safety. Prevents runtime
errors by guaranteeing essential properties are present.

## Extends

- [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`Monitor`](../../../../shared/types/interfaces/Monitor.md), `"history"` \| `"monitoring"` \| `"responseTime"` \| `"retryAttempts"` \| `"status"` \| `"timeout"` \| `"type"`\>.[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### history

> **history**: [`StatusHistory`](../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [shared/types.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L106)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`history`](../../../../shared/types/interfaces/Monitor.md#history)

***

### monitoring

> **monitoring**: `boolean`

Defined in: [shared/types.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L110)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`monitoring`](../../../../shared/types/interfaces/Monitor.md#monitoring)

***

### responseTime

> **responseTime**: `number`

Defined in: [shared/types.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L113)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`responseTime`](../../../../shared/types/interfaces/Monitor.md#responsetime)

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [shared/types.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L114)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`retryAttempts`](../../../../shared/types/interfaces/Monitor.md#retryattempts)

***

### status

> **status**: [`MonitorStatus`](../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [shared/types.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L115)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`status`](../../../../shared/types/interfaces/Monitor.md#status)

***

### timeout

> **timeout**: `number`

Defined in: [shared/types.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L116)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`timeout`](../../../../shared/types/interfaces/Monitor.md#timeout)

***

### type

> **type**: `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [shared/types.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L117)

#### Inherited from

[`Monitor`](../../../../shared/types/interfaces/Monitor.md).[`type`](../../../../shared/types/interfaces/Monitor.md#type)
