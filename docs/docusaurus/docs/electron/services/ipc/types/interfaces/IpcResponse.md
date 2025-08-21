# Interface: IpcResponse\<T\>

Defined in: [electron/services/ipc/types.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L49)

Base IPC response interface for consistent communication between main and
renderer processes.

## Remarks

Provides a standardized structure for all IPC handler responses, ensuring
consistent error handling and data format across the application. All IPC
handlers should use this response format.

## Example

```typescript
// Success response
const response: IpcResponse<Site[]> = {
    success: true,
    data: sites,
};

// Error response
const response: IpcResponse<void> = {
    success: false,
    error: "Failed to retrieve sites",
};
```

## Extended by

- [`IpcValidationResponse`](IpcValidationResponse.md)

## Type Parameters

### T

`T` = `unknown`

## Properties

### data?

> `optional` **data**: `T`

Defined in: [electron/services/ipc/types.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L51)

The response data when operation succeeds

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/ipc/types.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L53)

Error message when operation fails

***

### metadata?

> `optional` **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/ipc/types.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L55)

Additional metadata about the operation

***

### success

> **success**: `boolean`

Defined in: [electron/services/ipc/types.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L57)

Indicates if the operation was successful

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [electron/services/ipc/types.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/types.ts#L59)

Non-critical warnings about the operation
