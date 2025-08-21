# Interface: ErrorActions

Defined in: [src/stores/error/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L21)

Error management actions for the error store.

## Remarks

Provides methods for managing application-wide error states and loading
indicators. Supports both global errors and store-specific error isolation.

## Properties

### clearAllErrors()

> **clearAllErrors**: () => `void`

Defined in: [src/stores/error/types.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L23)

Clear all errors

#### Returns

`void`

***

### clearError()

> **clearError**: () => `void`

Defined in: [src/stores/error/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L25)

Clear global error

#### Returns

`void`

***

### clearStoreError()

> **clearStoreError**: (`store`) => `void`

Defined in: [src/stores/error/types.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L27)

Clear error for specific store

#### Parameters

##### store

`string`

#### Returns

`void`

***

### getOperationLoading()

> **getOperationLoading**: (`operation`) => `boolean`

Defined in: [src/stores/error/types.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L29)

Get loading state for specific operation

#### Parameters

##### operation

`string`

#### Returns

`boolean`

***

### getStoreError()

> **getStoreError**: (`store`) => `undefined` \| `string`

Defined in: [src/stores/error/types.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L31)

Get error for specific store

#### Parameters

##### store

`string`

#### Returns

`undefined` \| `string`

***

### setError()

> **setError**: (`error`) => `void`

Defined in: [src/stores/error/types.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L33)

Set global error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`loading`) => `void`

Defined in: [src/stores/error/types.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L35)

Set global loading state

#### Parameters

##### loading

`boolean`

#### Returns

`void`

***

### setOperationLoading()

> **setOperationLoading**: (`operation`, `loading`) => `void`

Defined in: [src/stores/error/types.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L37)

Set loading state for specific operation

#### Parameters

##### operation

`string`

##### loading

`boolean`

#### Returns

`void`

***

### setStoreError()

> **setStoreError**: (`store`, `error`) => `void`

Defined in: [src/stores/error/types.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/types.ts#L39)

Set error for specific store

#### Parameters

##### store

`string`

##### error

`undefined` | `string`

#### Returns

`void`
