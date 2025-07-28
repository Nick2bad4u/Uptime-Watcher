# Function: safeObjectPick()

> **safeObjectPick**\<`T`, `K`\>(`obj`, `keys`): [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<`T`, `K`\>

Defined in: [shared/utils/objectSafety.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/objectSafety.ts#L135)

Create a type-safe subset of an object with only specified keys.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`PropertyKey`, `unknown`\>

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

[`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<`T`, `K`\>

New object with only the specified keys

## Example

```typescript
const user = { id: 1, name: "John", email: "john@example.com", password: "secret" };
const publicUser = safeObjectPick(user, ["id", "name", "email"]);
// Type: { id: number; name: string; email: string; }
```
