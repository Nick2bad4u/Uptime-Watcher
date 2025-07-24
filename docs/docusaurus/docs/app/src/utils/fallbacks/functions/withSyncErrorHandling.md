# Function: withSyncErrorHandling()

> **withSyncErrorHandling**\<`T`\>(`operation`, `operationName`, `fallbackValue`): `T`

Defined in: [src/utils/fallbacks.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/fallbacks.ts#L45)

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
