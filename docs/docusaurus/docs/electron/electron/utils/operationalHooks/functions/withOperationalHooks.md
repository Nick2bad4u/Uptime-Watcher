# Function: withOperationalHooks()

> **withOperationalHooks**\<`T`\>(`operation`, `config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/operationalHooks.ts#L98)

Wraps an async operation with retry logic, error handling, and event emission.

## Type Parameters

### T

`T`

## Parameters

### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

### config

[`OperationalHooksConfig`](../interfaces/OperationalHooksConfig.md)\<`T`\>

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>
