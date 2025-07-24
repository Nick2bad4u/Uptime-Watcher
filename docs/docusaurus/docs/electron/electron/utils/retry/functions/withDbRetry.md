# Function: withDbRetry()

> **withDbRetry**\<`T`\>(`operation`, `operationName`, `maxRetries`): `Promise`\<`T`\>

Defined in: [electron/utils/retry.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/retry.ts#L16)

Database-specific retry wrapper with optimized settings for database operations.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

Database operation to retry

### operationName

`string`

Name of the operation for logging

### maxRetries

`number` = `5`

Maximum number of retry attempts (default: 5)

## Returns

`Promise`\<`T`\>

Promise that resolves with the operation result
