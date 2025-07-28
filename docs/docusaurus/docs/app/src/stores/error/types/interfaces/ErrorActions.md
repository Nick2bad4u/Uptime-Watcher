# Interface: ErrorActions

Defined in: [src/stores/error/types.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L20)

Error management actions for the error store.

## Remarks

Provides methods for managing application-wide error states and loading indicators.
Supports both global errors and store-specific error isolation.

## Properties

### clearAllErrors()

> **clearAllErrors**: () => `void`

Defined in: [src/stores/error/types.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L22)

Clear all errors

#### Returns

`void`

***

### clearError()

> **clearError**: () => `void`

Defined in: [src/stores/error/types.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L24)

Clear global error

#### Returns

`void`

***

### clearStoreError()

> **clearStoreError**: (`store`) => `void`

Defined in: [src/stores/error/types.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L26)

Clear error for specific store

#### Parameters

##### store

`string`

#### Returns

`void`

***

### getOperationLoading()

> **getOperationLoading**: (`operation`) => `boolean`

Defined in: [src/stores/error/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L28)

Get loading state for specific operation

#### Parameters

##### operation

`string`

#### Returns

`boolean`

***

### getStoreError()

> **getStoreError**: (`store`) => `undefined` \| `string`

Defined in: [src/stores/error/types.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L30)

Get error for specific store

#### Parameters

##### store

`string`

#### Returns

`undefined` \| `string`

***

### setError()

> **setError**: (`error`) => `void`

Defined in: [src/stores/error/types.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L32)

Set global error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`loading`) => `void`

Defined in: [src/stores/error/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L34)

Set global loading state

#### Parameters

##### loading

`boolean`

#### Returns

`void`

***

### setOperationLoading()

> **setOperationLoading**: (`operation`, `loading`) => `void`

Defined in: [src/stores/error/types.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L36)

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

Defined in: [src/stores/error/types.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/types.ts#L38)

Set error for specific store

#### Parameters

##### store

`string`

##### error

`undefined` | `string`

#### Returns

`void`
