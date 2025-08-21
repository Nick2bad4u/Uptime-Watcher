# Function: typedObjectValues()

> **typedObjectValues**\<`T`\>(`obj`): `T`\[keyof `T`\][]

Defined in: [shared/utils/objectSafety.ts:263](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/objectSafety.ts#L263)

Type-safe Object.values that preserves value types for known object shapes.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get values from

## Returns

`T`\[keyof `T`\][]

Array of values with proper typing

## Remarks

This function uses type assertion to preserve compile-time type information.
Object.values() only returns enumerable property values, so non-enumerable
properties and symbol-keyed properties are not included. The cast assumes all
values are of type T[keyof T], which is accurate for the enumerable
properties that Object.values() actually returns.

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const values = typedObjectValues(config);
// Type: number[]
```
