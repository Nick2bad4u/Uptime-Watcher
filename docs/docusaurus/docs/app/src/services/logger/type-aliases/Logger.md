# Type Alias: Logger

> **Logger** = *typeof* [`default`](../variables/default.md)

Defined in: [src/services/logger.ts:224](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/services/logger.ts#L224)

TypeScript interface for the logger instance.

## Remarks

Provides full type safety and IntelliSense support for the logger methods.
Use this type for dependency injection or when you need to reference
the logger type in function parameters or return types.

## Example

```typescript
function setupLogging(loggerInstance: Logger): void {
  loggerInstance.info("Application starting");
  loggerInstance.site.added("example.com");
}
```
