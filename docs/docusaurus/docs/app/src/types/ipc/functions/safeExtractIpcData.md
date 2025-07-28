# Function: safeExtractIpcData()

> **safeExtractIpcData**\<`T`\>(`response`, `fallback`): `T`

Defined in: [src/types/ipc.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L78)

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
