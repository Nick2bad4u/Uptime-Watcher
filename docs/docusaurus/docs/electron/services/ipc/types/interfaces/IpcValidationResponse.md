# Interface: IpcValidationResponse

Defined in: [electron/services/ipc/types.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L71)

Validation result interface specifically for monitor validation operations.

## Remarks

Extends the base IpcResponse pattern for monitor validation-specific
operations.

## Extends

- [`IpcResponse`](IpcResponse.md)\<[`ValidationResult`](../../../../../shared/types/validation/interfaces/ValidationResult.md)\>

## Properties

### data?

> `optional` **data**: [`ValidationResult`](../../../../../shared/types/validation/interfaces/ValidationResult.md)

Defined in: [electron/services/ipc/types.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L51)

The response data when operation succeeds

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`data`](IpcResponse.md#data)

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/ipc/types.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L53)

Error message when operation fails

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`error`](IpcResponse.md#error)

***

### metadata?

> `optional` **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/ipc/types.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L55)

Additional metadata about the operation

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`metadata`](IpcResponse.md#metadata)

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [electron/services/ipc/types.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L59)

Non-critical warnings about the operation

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`warnings`](IpcResponse.md#warnings)

***

### errors

> **errors**: `string`[]

Defined in: [electron/services/ipc/types.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L73)

List of validation errors (required for validation responses)

***

### success

> **success**: `boolean`

Defined in: [electron/services/ipc/types.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L75)

Whether validation passed (required for validation responses)

#### Overrides

[`IpcResponse`](IpcResponse.md).[`success`](IpcResponse.md#success)
