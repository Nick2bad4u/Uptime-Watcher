# Function: withDbRetry()

> **withDbRetry**\<`T`\>(`operation`, `operationName`, `maxRetries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/retry.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/retry.ts#L113)

Database-specific retry wrapper with optimized settings for database
operations.

## Type Parameters

### T

`T`

The return type of the database operation

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Database operation to retry

### operationName

`string`

Name of the operation for logging

### maxRetries

`number` = `5`

Maximum number of retry attempts (default: 5)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the operation result
