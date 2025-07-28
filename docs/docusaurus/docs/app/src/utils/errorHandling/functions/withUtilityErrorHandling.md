# Function: withUtilityErrorHandling()

> **withUtilityErrorHandling**\<`T`\>(`operation`, `operationName`, `fallbackValue?`, `shouldThrow?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/utils/errorHandling.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/errorHandling.ts#L30)

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

## Throws

When shouldThrow is true or when shouldThrow is false but no fallbackValue is provided
