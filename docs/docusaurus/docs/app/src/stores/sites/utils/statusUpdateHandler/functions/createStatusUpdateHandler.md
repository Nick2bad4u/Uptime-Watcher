# Function: createStatusUpdateHandler()

> **createStatusUpdateHandler**(`options`): (`update`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/utils/statusUpdateHandler.ts#L134)

Creates a status update handler with optimized incremental updates and race condition protection

## Parameters

### options

[`StatusUpdateHandlerOptions`](../interfaces/StatusUpdateHandlerOptions.md)

## Returns

> (`update`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### Parameters

#### update

[`StatusUpdate`](../../../../../../shared/types/interfaces/StatusUpdate.md)

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
