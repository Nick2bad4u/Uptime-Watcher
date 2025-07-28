# Function: withSyncErrorHandling()

> **withSyncErrorHandling**\<`T`\>(`operation`, `operationName`, `fallbackValue`): `T`

Defined in: [src/utils/fallbacks.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/fallbacks.ts#L45)

Synchronous error handling wrapper for operations that don't return promises.
Provides consistent error handling and fallback behavior for sync operations.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `T`

Synchronous operation to execute

### operationName

`string`

Name for logging purposes

### fallbackValue

`T`

Value to return if operation fails

## Returns

`T`

Result of operation or fallback value
