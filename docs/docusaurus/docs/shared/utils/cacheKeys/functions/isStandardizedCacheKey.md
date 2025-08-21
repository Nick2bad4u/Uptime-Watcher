# Function: isStandardizedCacheKey()

> **isStandardizedCacheKey**(`key`): `key is string`

Defined in: [shared/utils/cacheKeys.ts:323](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/cacheKeys.ts#L323)

Utility to validate if a string follows the standardized cache key pattern.

## Parameters

### key

`string`

Cache key to validate

## Returns

`key is string`

True if the key follows the standardized pattern

## Example

```typescript
const isValid = isStandardizedCacheKey("site:site-123");
// Returns: true

const isInvalid = isStandardizedCacheKey("random-key");
// Returns: false
```
