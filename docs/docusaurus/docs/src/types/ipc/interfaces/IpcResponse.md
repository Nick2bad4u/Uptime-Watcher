# Interface: IpcResponse\<T\>

Defined in: [src/types/ipc.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L48)

Standardized IPC response format.

## Type Parameters

### T

`T`

The type of data returned on success

## Properties

### data?

> `optional` **data**: `T`

Defined in: [src/types/ipc.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L50)

Response data when successful

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/ipc.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L52)

Error message when operation fails

***

### metadata?

> `optional` **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [src/types/ipc.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L54)

Additional operation metadata

***

### success

> **success**: `boolean`

Defined in: [src/types/ipc.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L56)

Indicates whether the operation was successful

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [src/types/ipc.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/ipc.ts#L58)

Non-critical warnings
