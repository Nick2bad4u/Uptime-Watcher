# Function: generateUuid()

> **generateUuid**(): `string`

Defined in: [src/utils/data/generateUuid.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/data/generateUuid.ts#L26)

Generate a unique identifier string using crypto.randomUUID with fallback.

## Returns

`string`

A UUID string in standard format or fallback format

## Remarks

Tries to use the native randomUUID() method from crypto module. If unavailable,
falls back to a timestamp-based ID with random characters for uniqueness.
The fallback ensures the function works in all environments.

## Example

```typescript
const id = generateUuid();
// Returns: "123e4567-e89b-12d3-a456-426614174000" (native)
// Or: "site-abc123def-1643234567890" (fallback)
```
