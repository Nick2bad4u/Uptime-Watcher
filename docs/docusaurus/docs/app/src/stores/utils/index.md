# src/stores/utils

Utility functions for store management and composition.

## Remarks

Provides common functionality for error handling, persistence, and store composition
across all Zustand stores in the application. These utilities ensure consistent
patterns for async operations, error states, and data persistence.

## Functions

- [createBaseStore](functions/createBaseStore.md)
- [createPersistConfig](functions/createPersistConfig.md)
- [debounce](functions/debounce.md)
- [logStoreAction](functions/logStoreAction.md)
- [waitForElectronAPI](functions/waitForElectronAPI.md)

## References

### withErrorHandling

Re-exports [withErrorHandling](../../../shared/utils/errorHandling/functions/withErrorHandling.md)
