# Function: withDbRetry()

> **withDbRetry**\<`T`\>(`operation`, `operationName`, `maxRetries`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/retry.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/retry.ts#L16)

Database-specific retry wrapper with optimized settings for database operations.

## Type Parameters

### T

`T`

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
