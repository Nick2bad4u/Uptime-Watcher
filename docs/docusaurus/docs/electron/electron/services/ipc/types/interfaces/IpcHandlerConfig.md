# Interface: IpcHandlerConfig\<TParams, TResult\>

Defined in: [electron/services/ipc/types.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L11)

Parameters for IPC handler wrapper configuration.

## Type Parameters

### TParams

`TParams` = `unknown`[]

### TResult

`TResult` = `unknown`

## Properties

### channelName

> **channelName**: `string`

Defined in: [electron/services/ipc/types.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L13)

Channel name for the IPC handler

***

### handler()

> **handler**: (...`args`) => `TResult` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/ipc/types.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L15)

The actual handler function

#### Parameters

##### args

...`TParams`[]

#### Returns

`TResult` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

***

### validateParams()?

> `optional` **validateParams**: (`params`) => `null` \| `string`[]

Defined in: [electron/services/ipc/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L17)

Optional parameter validation function

#### Parameters

##### params

`unknown`[]

#### Returns

`null` \| `string`[]
