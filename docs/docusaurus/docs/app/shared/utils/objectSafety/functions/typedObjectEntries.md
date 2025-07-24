# Function: typedObjectEntries()

> **typedObjectEntries**\<`T`\>(`obj`): \[keyof `T`, `T`\[keyof `T`\]\][]

Defined in: [shared/utils/objectSafety.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/objectSafety.ts#L155)

Type-safe Object.entries that preserves key types for known object shapes.

## Type Parameters

### T

`T` *extends* `Record`\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get entries from

## Returns

\[keyof `T`, `T`\[keyof `T`\]\][]

Array of [key, value] tuples with proper typing

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const entries = typedObjectEntries(config);
// Type: ["timeout" | "retries", number][]
```
