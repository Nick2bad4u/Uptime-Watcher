# Function: safeObjectOmit()

> **safeObjectOmit**\<`T`, `K`\>(`obj`, `keys`): [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<`T`, `K`\>

Defined in: [shared/utils/objectSafety.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/objectSafety.ts#L105)

Create a type-safe object with specified keys omitted.

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

Keys to omit from the object

## Returns

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<`T`, `K`\>

New object without the specified keys

## Example

```typescript
const user = { id: 1, name: "John", email: "john@example.com", password: "secret" };
const publicUser = safeObjectOmit(user, ["password"]);
// Type: { id: number; name: string; email: string; }
```
