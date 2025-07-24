# Function: withRetry()

> **withRetry**\<`T`\>(`operation`, `options`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/retry.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/retry.ts#L32)

Generic retry utility with configurable parameters

## Type Parameters

### T

`T`

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
