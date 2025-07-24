# Interface: ErrorState

Defined in: [src/stores/error/types.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/types.ts#L26)

## Properties

### isLoading

> **isLoading**: `boolean`

Defined in: [src/stores/error/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/types.ts#L28)

Global loading state

***

### lastError

> **lastError**: `undefined` \| `string`

Defined in: [src/stores/error/types.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/types.ts#L30)

Last error message to display

***

### operationLoading

> **operationLoading**: `Record`\<`string`, `boolean`\>

Defined in: [src/stores/error/types.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/types.ts#L32)

Loading states for specific operations

***

### storeErrors

> **storeErrors**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: [src/stores/error/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/types.ts#L34)

Store-specific error states
