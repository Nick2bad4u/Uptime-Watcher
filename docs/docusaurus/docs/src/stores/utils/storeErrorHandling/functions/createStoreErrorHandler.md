# Function: createStoreErrorHandler()

> **createStoreErrorHandler**(`storeKey`, `operationName`): [`ErrorHandlingFrontendStore`](../../../../../shared/utils/errorHandling/interfaces/ErrorHandlingFrontendStore.md)

Defined in: [src/stores/utils/storeErrorHandling.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/utils/storeErrorHandling.ts#L42)

Creates a standardized error handling context for store operations. Provides
consistent error state management across different store modules.

## Parameters

### storeKey

`string`

The key identifying the store for error tracking (e.g.,
  "sites-operations", "sites-monitoring")

### operationName

`string`

The name of the specific operation being performed
  (e.g., "createSite", "deleteSite")

## Returns

[`ErrorHandlingFrontendStore`](../../../../../shared/utils/errorHandling/interfaces/ErrorHandlingFrontendStore.md)

Error handling context compatible with `withErrorHandling` function

## Remarks

This factory eliminates the need to repeatedly define the same error handling
object structure across different store operations. It provides:

- Consistent error clearing before operations
- Standardized error state management on failures
- Proper loading state tracking during async operations

## Example

```typescript
await withErrorHandling(
    async () => {
        // Your async operation
        await window.electronAPI.sites.addSite(site);
    },
    createStoreErrorHandler("sites-operations", "createSite")
);
```
