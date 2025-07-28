# Function: ~~createStatusUpdateHandler()~~

> **createStatusUpdateHandler**(`options`): (`update`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:402](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/statusUpdateHandler.ts#L402)

Creates a status update handler with robust concurrency control (legacy function).

## Parameters

### options

[`StatusUpdateHandlerOptions`](../interfaces/StatusUpdateHandlerOptions.md)

Configuration options for the status update handler

## Returns

Async function that processes status updates safely

> (`update`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### Parameters

#### update

[`StatusUpdate`](../../../../../../shared/types/interfaces/StatusUpdate.md)

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

## Remarks

This function is maintained for backward compatibility but is no longer the recommended approach.
Use StatusUpdateManager for better performance and more efficient incremental updates.

## Deprecated

Use StatusUpdateManager instead for better performance
