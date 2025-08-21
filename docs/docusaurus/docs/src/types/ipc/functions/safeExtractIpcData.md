# Function: safeExtractIpcData()

> **safeExtractIpcData**\<`T`\>(`response`, `fallback`): `T`

Defined in: [src/types/ipc.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L116)

Safely handles IPC responses with fallback values.

## Type Parameters

### T

`T`

## Parameters

### response

`unknown`

The IPC response

### fallback

`T`

Fallback value if operation failed

## Returns

`T`

The data or fallback value
