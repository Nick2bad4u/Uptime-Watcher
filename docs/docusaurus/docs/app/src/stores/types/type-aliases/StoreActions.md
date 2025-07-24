# Type Alias: StoreActions\<T\>

> **StoreActions**\<`T`\> = `` [K in keyof T]: T[K] extends (arguments_: unknown[]) => unknown ? T[K] : never ``

Defined in: [src/stores/types.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/types.ts#L78)

Store composition utility type for extracting action methods from store interfaces.

## Type Parameters

### T

`T`

## Remarks

This utility type extracts only the function properties (actions) from a store
interface, filtering out state properties. It's useful for creating action-only
interfaces or for dependency injection patterns where only actions are needed.

## Example

```typescript
interface MyStore {
  data: string[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  clearData: () => void;
}

type MyStoreActions = StoreActions<MyStore>;
// Result: { fetchData: () => Promise<void>; clearData: () => void; }
```
