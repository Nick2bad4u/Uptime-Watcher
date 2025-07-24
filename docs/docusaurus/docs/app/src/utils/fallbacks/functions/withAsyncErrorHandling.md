# Function: withAsyncErrorHandling()

> **withAsyncErrorHandling**(`operation`, `operationName`): () => `void`

Defined in: [src/utils/fallbacks.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/fallbacks.ts#L30)

Type-safe utility for React async event handlers.
Prevents void return type issues with async operations.

## Parameters

### operation

() => `Promise`\<`void`\>

Async operation to execute

### operationName

`string`

Name for logging purposes

## Returns

Sync function suitable for React event handlers

> (): `void`

### Returns

`void`
