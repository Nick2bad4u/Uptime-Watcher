# Interface: ErrorState

Defined in: [src/stores/error/types.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L51)

Error state structure for centralized error management.

## Remarks

Maintains global error state, store-specific errors, and operation loading
states to provide comprehensive error tracking across the application.

## Properties

### isLoading

> **isLoading**: `boolean`

Defined in: [src/stores/error/types.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L53)

Global loading state

***

### lastError

> **lastError**: `undefined` \| `string`

Defined in: [src/stores/error/types.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L55)

Last error message to display

***

### operationLoading

> **operationLoading**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

Defined in: [src/stores/error/types.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L57)

Loading states for specific operations

***

### storeErrors

> **storeErrors**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `undefined`\>

Defined in: [src/stores/error/types.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L59)

Store-specific error states
