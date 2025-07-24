# Function: withOperationalHooks()

> **withOperationalHooks**\<`T`\>(`operation`, `config`): `Promise`\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/operationalHooks.ts#L98)

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
