# Function: withDbRetry()

> **withDbRetry**\<`T`\>(`operation`, `operationName`, `maxRetries`): `Promise`\<`T`\>

Defined in: [electron/utils/retry.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/retry.ts#L16)

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
