# shared/utils/cacheKeys

Centralized cache key generation utilities for consistent caching patterns.

## Remarks

Provides standardized key generation functions to ensure consistency across
all cache implementations throughout the application. All cache keys follow a
predictable pattern: `domain:operation:identifier` or `domain:identifier`.

## Example

```typescript
// Site-related cache keys
const siteKey = CacheKeys.site.byIdentifier("site-123");
// Result: "site:site-123"

// Monitor-related cache keys
const monitorKey = CacheKeys.monitor.byId("monitor-456");
// Result: "monitor:monitor-456"

// Configuration cache keys
const configKey = CacheKeys.config.byName("history-limit");
// Result: "config:history-limit"
```

## Type Aliases

- [StandardizedCacheKey](type-aliases/StandardizedCacheKey.md)

## Variables

- [CacheKeys](variables/CacheKeys.md)

## Functions

- [isStandardizedCacheKey](functions/isStandardizedCacheKey.md)
- [parseCacheKey](functions/parseCacheKey.md)
