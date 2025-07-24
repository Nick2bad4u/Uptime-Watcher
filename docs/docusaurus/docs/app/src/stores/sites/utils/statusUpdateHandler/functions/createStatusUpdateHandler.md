# Function: createStatusUpdateHandler()

> **createStatusUpdateHandler**(`options`): (`update`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/statusUpdateHandler.ts#L134)

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
