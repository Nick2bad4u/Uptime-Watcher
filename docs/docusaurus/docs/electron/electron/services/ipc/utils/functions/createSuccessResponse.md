# Function: createSuccessResponse()

> **createSuccessResponse**\<`T`\>(`data?`, `metadata?`, `warnings?`): [`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>

Defined in: [electron/services/ipc/utils.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L108)

Creates a standardized success response.

## Type Parameters

### T

`T`

## Parameters

### data?

`T`

The response data

### metadata?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional metadata

### warnings?

`string`[]

Optional warnings

## Returns

[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>

Standardized IPC success response
