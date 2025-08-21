# Function: castIpcResponse()

> **castIpcResponse**\<`T`\>(`response`, `validator?`): `T`

Defined in: [shared/utils/typeHelpers.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeHelpers.ts#L24)

Safely casts IPC response to expected type with basic validation.

## Type Parameters

### T

`T`

## Parameters

### response

`unknown`

IPC response of unknown type

### validator?

(`val`) => `val is T`

Optional validation function

## Returns

`T`

Response cast to expected type

## Remarks

Use this for IPC responses where we have a contract but can't guarantee
types. The validator provides additional runtime safety if provided.
