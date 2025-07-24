# Function: withUtilityErrorHandling()

> **withUtilityErrorHandling**\<`T`\>(`operation`, `operationName`, `fallbackValue?`, `shouldThrow?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/utils/errorHandling.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/errorHandling.ts#L29)

Simple error handling wrapper for utility functions.
Provides consistent error logging and error response formatting.

## Type Parameters

### T

`T`

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The async operation to execute

### operationName

`string`

Name of the operation for logging

### fallbackValue?

`T`

Value to return if operation fails (required if shouldThrow is false)

### shouldThrow?

`boolean` = `false`

Whether to throw on error or return fallback value

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to operation result or fallback value
