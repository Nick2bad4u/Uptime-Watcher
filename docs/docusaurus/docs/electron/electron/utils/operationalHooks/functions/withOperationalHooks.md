# Function: withOperationalHooks()

> **withOperationalHooks**\<`T`\>(`operation`, `config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/utils/operationalHooks.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/operationalHooks.ts#L112)

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
