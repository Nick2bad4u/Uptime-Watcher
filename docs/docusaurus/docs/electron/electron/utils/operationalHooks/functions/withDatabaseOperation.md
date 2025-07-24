# Function: withDatabaseOperation()

> **withDatabaseOperation**\<`T`\>(`operation`, `operationName`, `eventEmitter?`, `context?`): `Promise`\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L78)

Specialized wrapper for database operations with common patterns.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

### operationName

`string`

### eventEmitter?

[`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

### context?

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<`T`\>
