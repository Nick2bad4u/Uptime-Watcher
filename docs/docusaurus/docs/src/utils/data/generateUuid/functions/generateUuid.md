# Function: generateUuid()

> **generateUuid**(): `string`

Defined in: [src/utils/data/generateUuid.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/data/generateUuid.ts#L25)

Generate a unique identifier string using crypto.randomUUID with fallback.

## Returns

`string`

A UUID string in standard format or fallback format

## Example

```typescript
const id = generateUuid();
// Returns: "123e4567-e89b-12d3-a456-426614174000" (native)
// Or: "site-abc123def-1643234567890" (fallback)
```
