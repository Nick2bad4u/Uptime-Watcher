# Interface: IpcHandlerConfig\<TParams, TResult\>

Defined in: [electron/services/ipc/types.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L13)

Parameters for IPC handler wrapper configuration.

## Type Parameters

### TParams

`TParams` = `unknown`[]

### TResult

`TResult` = `unknown`

## Properties

### channelName

> **channelName**: `string`

Defined in: [electron/services/ipc/types.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L15)

Channel name for the IPC handler

***

### handler()

> **handler**: (...`args`) => `TResult` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/ipc/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L17)

The actual handler function

#### Parameters

##### args

...`TParams`[]

#### Returns

`TResult` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

***

### validateParams()?

> `optional` **validateParams**: (`params`) => `null` \| `string`[]

Defined in: [electron/services/ipc/types.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L19)

Optional parameter validation function

#### Parameters

##### params

`unknown`[]

#### Returns

`null` \| `string`[]
