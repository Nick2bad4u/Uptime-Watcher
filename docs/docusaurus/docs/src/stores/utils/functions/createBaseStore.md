# Function: createBaseStore()

> **createBaseStore**\<`T`\>(`set`): [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<`T`, `"clearError"` \| `"isLoading"` \| `"lastError"` \| `"setError"` \| `"setLoading"`\>

Defined in: [src/stores/utils.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/utils.ts#L42)

Creates a base store slice with common error handling functionality.

## Type Parameters

### T

`T` *extends* [`BaseStore`](../../types/interfaces/BaseStore.md)

## Parameters

### set

(`partial`) => `void`

Zustand set function for updating store state

## Returns

[`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<`T`, `"clearError"` \| `"isLoading"` \| `"lastError"` \| `"setError"` \| `"setLoading"`\>

Object containing common store methods and initial state values

## Remarks

This function provides a standardized way to add error handling, loading
states, and error management to any Zustand store. It ensures consistent
error handling patterns across all stores in the application.

## Example

```typescript
const useMyStore = create<MyStore>((set, get) => ({
    ...createBaseStore(set),
    // ... other store properties
}));
```
