# Function: createErrorResponse()

> **createErrorResponse**\<`T`\>(`error`, `metadata?`): [`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>

Defined in: [electron/services/ipc/utils.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/utils.ts#L101)

Creates a standardized error response.

## Type Parameters

### T

`T` = `void`

## Parameters

### error

`string`

Error message

### metadata?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional metadata

## Returns

[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>

Standardized IPC error response
