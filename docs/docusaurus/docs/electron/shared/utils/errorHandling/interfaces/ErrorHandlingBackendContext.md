# Interface: ErrorHandlingBackendContext

Defined in: [shared/utils/errorHandling.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/errorHandling.ts#L12)

Shared error handling utility for async operations.
Provides a unified pattern for error logging, reporting, and state management.

Usage (frontend):
  await withErrorHandling(() =\> doSomethingAsync(), store)

Usage (backend):
  await withErrorHandling(() =\> doSomethingAsync(), ` logger, operationName: "operation" `)

## Properties

### logger

> **logger**: `object`

Defined in: [shared/utils/errorHandling.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/errorHandling.ts#L13)

#### error()

> **error**: (`msg`, `err`) => `void`

##### Parameters

###### msg

`string`

###### err

`unknown`

##### Returns

`void`

***

### operationName?

> `optional` **operationName**: `string`

Defined in: [shared/utils/errorHandling.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/errorHandling.ts#L16)
