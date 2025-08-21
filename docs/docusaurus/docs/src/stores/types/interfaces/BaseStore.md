# Interface: BaseStore

Defined in: [src/stores/types.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L40)

Base store interface providing common error handling and loading state
functionality.

## Remarks

Standard error handling and loading state pattern used across all stores. All
store interfaces should extend this for consistent error handling.

## Properties

### clearError()

> **clearError**: () => `void`

Defined in: [src/stores/types.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L42)

Clear the current error message

#### Returns

`void`

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/stores/types.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L44)

Whether an async operation is currently in progress

***

### lastError

> **lastError**: `undefined` \| `string`

Defined in: [src/stores/types.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L46)

The last error message, if any

***

### setError()

> **setError**: (`error`) => `void`

Defined in: [src/stores/types.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L48)

Set an error message in the store

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`loading`) => `void`

Defined in: [src/stores/types.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/types.ts#L50)

Set the loading state

#### Parameters

##### loading

`boolean`

#### Returns

`void`
