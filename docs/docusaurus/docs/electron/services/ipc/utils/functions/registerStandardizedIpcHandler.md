# Function: registerStandardizedIpcHandler()

> **registerStandardizedIpcHandler**\<`T`\>(`channelName`, `handler`, `validateParams`, `registeredHandlers`): `void`

Defined in: [electron/services/ipc/utils.ts:368](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/utils.ts#L368)

Registers a standardized IPC handler with consistent error handling and
response formatting.

## Type Parameters

### T

`T`

## Parameters

### channelName

`string`

Name of the IPC channel

### handler

(...`args`) => `T` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The handler function

### validateParams

Optional parameter validation function

`null` | [`IpcParameterValidator`](../../types/type-aliases/IpcParameterValidator.md)

### registeredHandlers

[`Set`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)\<`string`\>

Set to track registered handlers for cleanup

## Returns

`void`

## Remarks

Registers an IPC handler with the electron ipcMain, automatically wrapping it
with standardized error handling, logging, and response formatting. All
responses will follow the IpcResponse interface for consistency.

## Example

```typescript
registerStandardizedIpcHandler(
    "get-sites",
    async () => this.uptimeOrchestrator.getSites(),
    null,
    this.registeredIpcHandlers
);
```
