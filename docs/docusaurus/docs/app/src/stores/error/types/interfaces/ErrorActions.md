# Interface: ErrorActions

Defined in: [src/stores/error/types.ts:5](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L5)

Error store types and interfaces.

## Properties

### clearAllErrors()

> **clearAllErrors**: () => `void`

Defined in: [src/stores/error/types.ts:7](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L7)

Clear all errors

#### Returns

`void`

***

### clearError()

> **clearError**: () => `void`

Defined in: [src/stores/error/types.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L9)

Clear global error

#### Returns

`void`

***

### clearStoreError()

> **clearStoreError**: (`store`) => `void`

Defined in: [src/stores/error/types.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L11)

Clear error for specific store

#### Parameters

##### store

`string`

#### Returns

`void`

***

### getOperationLoading()

> **getOperationLoading**: (`operation`) => `boolean`

Defined in: [src/stores/error/types.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L13)

Get loading state for specific operation

#### Parameters

##### operation

`string`

#### Returns

`boolean`

***

### getStoreError()

> **getStoreError**: (`store`) => `undefined` \| `string`

Defined in: [src/stores/error/types.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L15)

Get error for specific store

#### Parameters

##### store

`string`

#### Returns

`undefined` \| `string`

***

### setError()

> **setError**: (`error`) => `void`

Defined in: [src/stores/error/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L17)

Set global error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`loading`) => `void`

Defined in: [src/stores/error/types.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L19)

Set global loading state

#### Parameters

##### loading

`boolean`

#### Returns

`void`

***

### setOperationLoading()

> **setOperationLoading**: (`operation`, `loading`) => `void`

Defined in: [src/stores/error/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L21)

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

Defined in: [src/stores/error/types.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/types.ts#L23)

Set error for specific store

#### Parameters

##### store

`string`

##### error

`undefined` | `string`

#### Returns

`void`
