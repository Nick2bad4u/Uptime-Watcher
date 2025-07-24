# Function: createStatusUpdateHandler()

> **createStatusUpdateHandler**(`options`): (`update`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L134)

Creates a status update handler with optimized incremental updates and race condition protection

## Parameters

### options

[`StatusUpdateHandlerOptions`](../interfaces/StatusUpdateHandlerOptions.md)

## Returns

> (`update`): `Promise`\<`void`\>

### Parameters

#### update

[`StatusUpdate`](../../../../../../shared/types/interfaces/StatusUpdate.md)

### Returns

`Promise`\<`void`\>
