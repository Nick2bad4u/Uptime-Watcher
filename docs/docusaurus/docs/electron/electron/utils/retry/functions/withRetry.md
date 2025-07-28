# Function: withRetry()

> **withRetry**\<`T`\>(`operation`, `options`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/retry.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/retry.ts#L34)

Generic retry utility with configurable parameters

## Type Parameters

### T

`T`

The return type of the async operation

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The async operation to retry

### options

Retry configuration options

#### delayMs?

`number`

#### maxRetries?

`number`

#### onError?

(`error`, `attempt`) => `void`

#### operationName?

`string`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the operation result

## Throws

Error if all retry attempts fail
