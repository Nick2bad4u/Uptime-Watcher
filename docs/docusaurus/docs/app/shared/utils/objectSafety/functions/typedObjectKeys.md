# Function: typedObjectKeys()

> **typedObjectKeys**\<`T`\>(`obj`): keyof `T`[]

Defined in: [shared/utils/objectSafety.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/objectSafety.ts#L172)

Type-safe Object.keys that preserves key types for known object shapes.

## Type Parameters

### T

`T` *extends* `Record`\<`PropertyKey`, `unknown`\>

## Parameters

### obj

`T`

Object to get keys from

## Returns

keyof `T`[]

Array of keys with proper typing

## Example

```typescript
const config = { timeout: 5000, retries: 3 } as const;
const keys = typedObjectKeys(config);
// Type: ("timeout" | "retries")[]
```
