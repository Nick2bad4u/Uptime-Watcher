# Function: withRetry()

> **withRetry**\<`T`\>(`operation`, `options`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/retry.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/retry.ts#L48)

Generic retry utility with configurable parameters.

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

## Remarks

Executes the provided operation with automatic retry logic on failure. Uses a
simple delay between retries (not exponential backoff) for predictable
timing. Collects all errors and reports them if all retries fail.

## Throws

Error if all retry attempts fail
