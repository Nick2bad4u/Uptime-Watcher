# Interface: IpcResponse\<T\>

Defined in: [src/types/ipc.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L17)

Standardized IPC response format.

## Type Parameters

### T

`T`

The type of data returned on success

## Properties

### data?

> `optional` **data**: `T`

Defined in: [src/types/ipc.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L19)

Response data when successful

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/ipc.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L21)

Error message when operation fails

***

### metadata?

> `optional` **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [src/types/ipc.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L23)

Additional operation metadata

***

### success

> **success**: `boolean`

Defined in: [src/types/ipc.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L25)

Indicates whether the operation was successful

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [src/types/ipc.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/ipc.ts#L27)

Non-critical warnings
