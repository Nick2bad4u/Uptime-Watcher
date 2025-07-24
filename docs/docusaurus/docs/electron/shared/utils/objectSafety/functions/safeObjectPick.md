# Function: safeObjectPick()

> **safeObjectPick**\<`T`, `K`\>(`obj`, `keys`): `Pick`\<`T`, `K`\>

Defined in: [shared/utils/objectSafety.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/objectSafety.ts#L126)

Create a type-safe subset of an object with only specified keys.

## Type Parameters

### T

`T` *extends* `Record`\<`PropertyKey`, `unknown`\>

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### obj

`T`

Source object

### keys

readonly `K`[]

Keys to pick from the object

## Returns

`Pick`\<`T`, `K`\>

New object with only the specified keys

## Example

```typescript
const user = { id: 1, name: "John", email: "john@example.com", password: "secret" };
const publicUser = safeObjectPick(user, ["id", "name", "email"]);
// Type: { id: number; name: string; email: string; }
```
