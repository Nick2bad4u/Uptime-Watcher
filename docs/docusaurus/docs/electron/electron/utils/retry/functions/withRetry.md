# Function: withRetry()

> **withRetry**\<`T`\>(`operation`, `options`): `Promise`\<`T`\>

Defined in: [electron/utils/retry.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/retry.ts#L32)

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
