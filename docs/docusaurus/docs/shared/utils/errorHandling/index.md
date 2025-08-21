# shared/utils/errorHandling

Shared error handling utilities for async operations.

## Remarks

Provides a unified pattern for error logging, reporting, and state management
across frontend and backend code.

## Example

Frontend usage:

```typescript
await withErrorHandling(() => doSomethingAsync(), store);
```

Backend usage:

```typescript
await withErrorHandling(() => doSomethingAsync(), {
    logger,
    operationName: "operation",
});
```

## Interfaces

- [ErrorHandlingBackendContext](interfaces/ErrorHandlingBackendContext.md)
- [ErrorHandlingFrontendStore](interfaces/ErrorHandlingFrontendStore.md)
