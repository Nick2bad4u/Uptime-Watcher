# Function: typedObjectEntries()

> **typedObjectEntries**\<`T`\>(`obj`): \[keyof `T`, `T`\[keyof `T`\]\][]

Defined in: [shared/utils/objectSafety.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/objectSafety.ts#L207)

Type-safe Object.entries that preserves key types for known object shapes.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get entries from

## Returns

\[keyof `T`, `T`\[keyof `T`\]\][]

Array of [key, value] tuples with proper typing

## Remarks

This function uses type assertion to preserve compile-time type information.
The cast is safe for plain objects but should be used carefully with objects
that may have prototype pollution, non-enumerable properties, or symbol keys.
Object.entries() only returns enumerable string-keyed properties.

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const entries = typedObjectEntries(config);
// Type: ["timeout" | "retries", number][]
```
