# Type Alias: StoreState\<T\>

> **StoreState**\<`T`\> = `` [K in keyof T]: T[K] extends (arguments_: unknown[]) => unknown ? never : T[K] ``

Defined in: [src/stores/types.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L103)

Store state utility type for extracting state properties from store interfaces.

## Type Parameters

### T

`T`

## Remarks

This utility type extracts only the non-function properties (state) from a store
interface, filtering out action methods. It's useful for creating state-only
interfaces or for serialization purposes where only data needs to be preserved.

## Example

```typescript
interface MyStore {
  data: string[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  clearData: () => void;
}

type MyStoreState = StoreState<MyStore>;
// Result: { data: string[]; isLoading: boolean; }
```
