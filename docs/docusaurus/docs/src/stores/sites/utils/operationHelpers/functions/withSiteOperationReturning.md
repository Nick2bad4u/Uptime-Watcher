# Function: withSiteOperationReturning()

> **withSiteOperationReturning**\<`T`\>(`operationName`, `operation`, `params`, `deps`, `syncAfter`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [src/stores/sites/utils/operationHelpers.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/operationHelpers.ts#L107)

Wraps a site operation with consistent logging, error handling, and optional
sync. This version supports operations that return a value.

## Type Parameters

### T

`T`

## Parameters

### operationName

`string`

Name of the operation for logging and error handling

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The async operation to execute that returns a value

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves to the operation result
