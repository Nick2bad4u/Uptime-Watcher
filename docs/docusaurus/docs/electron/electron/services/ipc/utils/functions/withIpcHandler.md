# Function: withIpcHandler()

> **withIpcHandler**\<`T`\>(`channelName`, `handler`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>\>

Defined in: [electron/services/ipc/utils.ts:219](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L219)

Wraps an IPC handler with standardized error handling, logging, and response formatting.

## Type Parameters

### T

`T`

## Parameters

### channelName

`string`

Name of the IPC channel

### handler

() => `T` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The handler function to wrap

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>\>

The wrapped handler result

## Remarks

Provides consistent error handling, logging, and response formatting for all IPC handlers.
Automatically logs handler execution and errors, validates parameters if provided,
and ensures all responses follow the standardized format.

## Example

```typescript
const result = await withIpcHandler(
  "get-sites",
  async () => this.uptimeOrchestrator.getSites()
);
```
