# Function: safeObjectAccess()

> **safeObjectAccess**\<`T`\>(`obj`, `key`, `fallback`, `validator?`): `T`

Defined in: [shared/utils/objectSafety.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/objectSafety.ts#L35)

Type-safe object property access with fallback.

## Type Parameters

### T

`T`

## Parameters

### obj

`unknown`

Object to access property from

### key

`PropertyKey`

Property key (string or symbol only)

### fallback

`T`

Fallback value if property doesn't exist or is wrong type

### validator?

(`value`) => `value is T`

Optional type guard function to validate the property
  value

## Returns

`T`

Property value or fallback

## Remarks

Only accepts string and symbol keys as these are the valid property key types
in JavaScript. Number keys are automatically converted to strings by
JavaScript, so use string keys directly to avoid confusion.

## Example

```typescript
const config: unknown = { timeout: 5000 };
const timeout = safeObjectAccess(config, "timeout", 10000);
// Returns 5000 if timeout exists and is correct type, otherwise 10000
```
