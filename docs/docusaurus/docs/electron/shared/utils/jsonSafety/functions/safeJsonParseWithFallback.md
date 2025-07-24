# Function: safeJsonParseWithFallback()

> **safeJsonParseWithFallback**\<`T`\>(`json`, `validator`, `fallback`): `T`

Defined in: [shared/utils/jsonSafety.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/jsonSafety.ts#L127)

Safely parse JSON string with fallback value.

## Type Parameters

### T

`T`

## Parameters

### json

`string`

JSON string to parse

### validator

(`data`) => `data is T`

Type guard function to validate the parsed data

### fallback

`T`

Fallback value if parsing fails

## Returns

`T`

Parsed data if successful, fallback if failed

## Example

```typescript
const config = safeJsonParseWithFallback(
    configString,
    (data): data is Config => isValidConfig(data),
    { timeout: 5000, retries: 3 }
);
```
