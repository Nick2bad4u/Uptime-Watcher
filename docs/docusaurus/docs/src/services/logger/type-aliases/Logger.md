# Type Alias: Logger

> **Logger** = *typeof* [`logger`](../variables/logger.md)

Defined in: [src/services/logger.ts:327](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/logger.ts#L327)

TypeScript interface for the logger instance.

## Remarks

Provides full type safety and IntelliSense support for the logger methods.
Use this type for dependency injection or when you need to reference the
logger type in function parameters or return types.

## Example

```typescript
function setupLogging(loggerInstance: Logger): void {
    loggerInstance.info("Application starting");
    loggerInstance.site.added("example.com");
}
```
