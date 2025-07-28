# Function: createErrorResponse()

> **createErrorResponse**\<`T`\>(`error`, `metadata?`): [`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>

Defined in: [electron/services/ipc/utils.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L85)

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
