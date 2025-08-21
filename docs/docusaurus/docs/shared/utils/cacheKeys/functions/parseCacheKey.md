# Function: parseCacheKey()

> **parseCacheKey**(`key`): `object`

Defined in: [shared/utils/cacheKeys.ts:361](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/cacheKeys.ts#L361)

Parse a standardized cache key into its components.

## Parameters

### key

`string`

Standardized cache key to parse

## Returns

`object`

Object containing the key components

### identifier

> **identifier**: `string`

### operation?

> `optional` **operation**: `string`

### prefix

> **prefix**: `string`

## Example

```typescript
const components = parseCacheKey("site:loading:site-123");
// Returns: { identifier: "site-123", operation: "loading", prefix: "site" }
```
