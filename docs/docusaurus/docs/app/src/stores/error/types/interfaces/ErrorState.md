# Interface: ErrorState

Defined in: [src/stores/error/types.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L50)

Error state structure for centralized error management.

## Remarks

Maintains global error state, store-specific errors, and operation loading states
to provide comprehensive error tracking across the application.

## Properties

### isLoading

> **isLoading**: `boolean`

Defined in: [src/stores/error/types.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L52)

Global loading state

***

### lastError

> **lastError**: `undefined` \| `string`

Defined in: [src/stores/error/types.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L54)

Last error message to display

***

### operationLoading

> **operationLoading**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `boolean`\>

Defined in: [src/stores/error/types.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L56)

Loading states for specific operations

***

### storeErrors

> **storeErrors**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `undefined`\>

Defined in: [src/stores/error/types.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L58)

Store-specific error states
