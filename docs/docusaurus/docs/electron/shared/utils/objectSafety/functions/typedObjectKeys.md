# Function: typedObjectKeys()

> **typedObjectKeys**\<`T`\>(`obj`): keyof `T`[]

Defined in: [shared/utils/objectSafety.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/objectSafety.ts#L172)

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
