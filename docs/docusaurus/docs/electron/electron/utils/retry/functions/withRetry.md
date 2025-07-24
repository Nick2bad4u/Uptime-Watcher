# Function: withRetry()

> **withRetry**\<`T`\>(`operation`, `options`): `Promise`\<`T`\>

Defined in: [electron/utils/retry.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/retry.ts#L32)

Generic retry utility with configurable parameters

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

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

`Promise`\<`T`\>

Promise that resolves with the operation result

## Throws

Error if all retry attempts fail
