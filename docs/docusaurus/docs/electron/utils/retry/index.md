# electron/utils/retry

Retry utility for handling transient failures in database and network
operations.

## Remarks

Provides configurable retry logic with exponential backoff for robust error
handling in backend operations. Useful for dealing with temporary network
issues, database locks, or other transient failures.

## Example

```typescript
// Simple retry with defaults
const result = await withRetry(() => fetchData());

// Retry with custom configuration
const result = await withRetry(() => database.query(sql), {
    maxRetries: 3,
    delayMs: 1000,
    operationName: "database query",
    onError: (error, attempt) =>
        logger.warn(`Attempt ${attempt} failed`),
});
```

## Functions

- [withRetry](functions/withRetry.md)
- [withDbRetry](functions/withDbRetry.md)
