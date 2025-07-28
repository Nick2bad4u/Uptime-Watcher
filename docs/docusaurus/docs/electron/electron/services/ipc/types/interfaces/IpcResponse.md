# Interface: IpcResponse\<T\>

Defined in: [electron/services/ipc/types.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L54)

Base IPC response interface for consistent communication between main and renderer processes.

## Remarks

Provides a standardized structure for all IPC handler responses, ensuring consistent error handling
and data format across the application. All IPC handlers should use this response format.

## Example

```typescript
// Success response
const response: IpcResponse<Site[]> = {
  success: true,
  data: sites
};

// Error response
const response: IpcResponse<void> = {
  success: false,
  error: "Failed to retrieve sites"
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

Defined in: [electron/services/ipc/types.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L56)

The response data when operation succeeds

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/ipc/types.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L58)

Error message when operation fails

***

### metadata?

> `optional` **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/ipc/types.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L60)

Additional metadata about the operation

***

### success

> **success**: `boolean`

Defined in: [electron/services/ipc/types.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L62)

Indicates if the operation was successful

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [electron/services/ipc/types.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/types.ts#L64)

Non-critical warnings about the operation
