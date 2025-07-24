# Function: safeObjectAccess()

> **safeObjectAccess**\<`T`\>(`obj`, `key`, `fallback`, `validator?`): `T`

Defined in: [shared/utils/objectSafety.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/objectSafety.ts#L23)

Type-safe object property access with fallback.

## Type Parameters

### T

`T`

## Parameters

### obj

`unknown`

Object to access property from

### key

Property key

`string` | `number`

### fallback

`T`

Fallback value if property doesn't exist or is wrong type

### validator?

(`value`) => `value is T`

## Returns

`T`

Property value or fallback

## Example

```typescript
const config: unknown = { timeout: 5000 };
const timeout = safeObjectAccess(config, "timeout", 10000);
// Returns 5000 if timeout exists and is correct type, otherwise 10000
```
