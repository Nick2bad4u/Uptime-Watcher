# Function: withSiteOperation()

> **withSiteOperation**(`operationName`, `operation`, `params`, `deps`, `syncAfter`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/operationHelpers.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/operationHelpers.ts#L75)

Wraps a site operation with consistent logging, error handling, and optional
sync. Eliminates duplication of the common pattern used across all site
operations.

## Parameters

### operationName

`string`

Name of the operation for logging and error handling

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

The async operation to execute

### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Parameters passed to the operation for logging

### deps

[`SiteOperationsDependencies`](../../../types/interfaces/SiteOperationsDependencies.md)

Site operation dependencies

### syncAfter

`boolean` = `true`

Whether to sync from backend after the operation

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when operation and optional sync complete
