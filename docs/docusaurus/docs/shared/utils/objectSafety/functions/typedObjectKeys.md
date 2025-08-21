# Function: typedObjectKeys()

> **typedObjectKeys**\<`T`\>(`obj`): keyof `T`[]

Defined in: [shared/utils/objectSafety.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/objectSafety.ts#L235)

Type-safe Object.keys that preserves key types for known object shapes.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get keys from

## Returns

keyof `T`[]

Array of keys with proper typing

## Remarks

This function uses type assertion to preserve compile-time type information.
Note that Object.keys() only returns enumerable string-keyed properties, so
symbol keys are not included in the result. The cast assumes all keys are of
type keyof T, which is safe for plain objects but may not include all
possible keys for objects with symbol keys or inherited properties.

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const keys = typedObjectKeys(config);
// Type: ("timeout" | "retries")[]
```
