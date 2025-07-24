# Function: typedObjectValues()

> **typedObjectValues**\<`T`\>(`obj`): `T`\[keyof `T`\][]

Defined in: [shared/utils/objectSafety.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/objectSafety.ts#L189)

Type-safe Object.values that preserves value types for known object shapes.

## Type Parameters

### T

`T` *extends* `Record`\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get values from

## Returns

`T`\[keyof `T`\][]

Array of values with proper typing

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const values = typedObjectValues(config);
// Type: number[]
```
