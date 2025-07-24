# Interface: BaseStore

Defined in: [src/stores/types.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L39)

Base store interface providing common error handling and loading state functionality.

## Remarks

Standard error handling and loading state pattern used across all stores.
All store interfaces should extend this for consistent error handling.

## Properties

### clearError()

> **clearError**: () => `void`

Defined in: [src/stores/types.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L41)

Clear the current error message

#### Returns

`void`

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/stores/types.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L43)

Whether an async operation is currently in progress

***

### lastError

> **lastError**: `undefined` \| `string`

Defined in: [src/stores/types.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L45)

The last error message, if any

***

### setError()

> **setError**: (`error`) => `void`

Defined in: [src/stores/types.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L47)

Set an error message in the store

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`loading`) => `void`

Defined in: [src/stores/types.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/types.ts#L49)

Set the loading state

#### Parameters

##### loading

`boolean`

#### Returns

`void`
