# Function: withAsyncErrorHandling()

> **withAsyncErrorHandling**(`operation`, `operationName`): () => `void`

Defined in: [src/utils/fallbacks.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/fallbacks.ts#L30)

Type-safe utility for React async event handlers.
Prevents void return type issues with async operations.

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Async operation to execute

### operationName

`string`

Name for logging purposes

## Returns

Sync function suitable for React event handlers

> (): `void`

### Returns

`void`
