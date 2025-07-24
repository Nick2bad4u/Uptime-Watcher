# Function: withOperationalHooks()

> **withOperationalHooks**\<`T`\>(`operation`, `config`): `Promise`\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/operationalHooks.ts#L98)

Wraps an async operation with retry logic, error handling, and event emission.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

### config

[`OperationalHooksConfig`](../interfaces/OperationalHooksConfig.md)\<`T`\>

## Returns

`Promise`\<`T`\>
