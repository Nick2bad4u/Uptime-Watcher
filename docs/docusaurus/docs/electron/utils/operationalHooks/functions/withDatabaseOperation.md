# Function: withDatabaseOperation()

> **withDatabaseOperation**\<`T`\>(`operation`, `operationName`, `eventEmitter?`, `context?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:473](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/operationalHooks.ts#L473)

Specialized wrapper for database operations with database-specific defaults.

## Type Parameters

### T

`T`

The return type of the database operation

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Database operation to execute with retry logic

### operationName

`string`

Name of the database operation (will be prefixed with
  "database:")

### eventEmitter?

[`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Optional event emitter for operation lifecycle events

### context?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional context data to include in events

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to the operation result

## Remarks

This function is a convenience wrapper around withOperationalHooks that
applies database-optimized settings and adds a "database:" prefix to
operation names for consistent event naming. While the underlying
implementation is generic, this wrapper should only be used for actual
database operations to maintain clear semantic boundaries and event
categorization.
