# Interface: IpcValidationResponse

Defined in: [electron/services/ipc/types.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L76)

Validation result interface specifically for monitor validation operations.

## Remarks

Extends the base IpcResponse pattern for monitor validation-specific operations.
Maintains backward compatibility with existing validation code.

## Extends

- [`IpcResponse`](IpcResponse.md)\<`unknown`\>

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [electron/services/ipc/types.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L56)

The response data when operation succeeds

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`data`](IpcResponse.md#data)

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/ipc/types.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L58)

Error message when operation fails

#### Inherited from

[`IpcResponse`](IpcResponse.md).[`error`](IpcResponse.md#error)

***

### errors

> **errors**: `string`[]

Defined in: [electron/services/ipc/types.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L78)

List of validation errors

***

### metadata

> **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/ipc/types.ts:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L80)

Additional metadata from validation

#### Overrides

[`IpcResponse`](IpcResponse.md).[`metadata`](IpcResponse.md#metadata)

***

### success

> **success**: `boolean`

Defined in: [electron/services/ipc/types.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L82)

Whether validation passed

#### Overrides

[`IpcResponse`](IpcResponse.md).[`success`](IpcResponse.md#success)

***

### warnings

> **warnings**: `string`[]

Defined in: [electron/services/ipc/types.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L84)

Non-blocking validation warnings

#### Overrides

[`IpcResponse`](IpcResponse.md).[`warnings`](IpcResponse.md#warnings)
