# Function: createPersistConfig()

> **createPersistConfig**\<`T`\>(`name`, `partialize?`): `object`

Defined in: [src/stores/utils.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/utils.ts#L89)

Creates a persistence configuration for Zustand store persistence.

## Type Parameters

### T

`T`

## Parameters

### name

`string`

Unique name for the persisted store data

### partialize?

(`state`) => [`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<`T`\>

Optional function to select which parts of state to
  persist

## Returns

`object`

Configuration object for zustand/middleware/persist

### name

> **name**: `string`

### partialize

> **partialize**: `undefined` \| (`state`) => [`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<`T`\>

## Remarks

This utility creates a standardized persistence configuration that prefixes
all store names with 'uptime-watcher-' to avoid conflicts with other
applications. The partialize function allows selective persistence of store
properties.

## Example

```typescript
const useMyStore = create(
    persist((set, get) => ({}), createPersistConfig("my-store"))
);
```
