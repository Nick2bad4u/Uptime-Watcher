# Function: withIpcHandlerValidation()

> **withIpcHandlerValidation**\<`T`\>(`channelName`, `handler`, `validateParams`, `params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>\>

Defined in: [electron/services/ipc/utils.ts:277](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/utils.ts#L277)

Wraps an IPC handler with parameter validation, standardized error handling, and response formatting.

## Type Parameters

### T

`T`

## Parameters

### channelName

`string`

Name of the IPC channel

### handler

(...`args`) => `T` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The handler function to wrap

### validateParams

[`IpcParameterValidator`](../../types/type-aliases/IpcParameterValidator.md)

Parameter validation function

### params

`unknown`[]

The parameters to validate and pass to the handler

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IpcResponse`](../../types/interfaces/IpcResponse.md)\<`T`\>\>

The wrapped handler result

## Remarks

Extended version of withIpcHandler that includes parameter validation.
Validates parameters before executing the handler and provides detailed error messages.

## Example

```typescript
const result = await withIpcHandlerValidation(
  "add-site",
  async (site: Site) => this.uptimeOrchestrator.addSite(site),
  (params) => IpcValidators.requiredObject(params[0], "site"),
  [siteData]
);
```
